const { asyncHandler } = require('../middleware/errorHandler');
const { getDb } = require('../config/db');
const fieldSearchConfig = require('../config/fieldSearchConfig');

/**
 * GET /api/search/suggestions
 * Query params:
 *  - field: logical field key (e.g. "customerName", "invoiceNumber")
 *  - q: search text
 *
 * Returns unique, merged suggestions across all configured sources for the field.
 */
exports.searchSuggestions = asyncHandler(async (req, res) => {
  const db = getDb();
  const fieldKey = String(req.query.field || '').trim();
  const q = String(req.query.q || '').trim();
  const limit = Math.min(Number(req.query.limit) || 20, 50); // hard cap

  if (!fieldKey) {
    return res.status(400).json({
      success: false,
      message: 'Missing required "field" query parameter',
    });
  }

  const config = fieldSearchConfig[fieldKey];
  if (!config || !Array.isArray(config.sources) || config.sources.length === 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown field "${fieldKey}". Please configure it in fieldSearchConfig.`,
    });
  }

  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available',
      data: [],
    });
  }

  const suggestions = new Set();

  // Run each source query sequentially; we keep it simple and safe.
  // Each source uses a case-insensitive LIKE search where supported.
  for (const source of config.sources) {
    const { table, column, minId } = source;
    if (!table || !column) continue;

    try {
      let qb = db(table);
      if (minId != null) {
        qb = qb.where('id', '>=', Number(minId));
      }

      let rows;
      if (q) {
        // Use whereILike when available (MySQL 8 / PostgreSQL), fallback to where with LOWER().
        if (typeof db(table).whereILike === 'function') {
          rows = await qb
            .whereILike(column, `%${q}%`)
            .limit(limit)
            .pluck(column);
        } else {
          rows = await qb
            .whereRaw(`LOWER(??) LIKE ?`, [column, `%${q.toLowerCase()}%`])
            .limit(limit)
            .pluck(column);
        }
      } else {
        // Initial load: just take the most recent / top values for this column.
        rows = await qb
          .whereNotNull(column)
          .orderBy(column, 'asc')
          .limit(limit)
          .pluck(column);
      }

      (rows || []).forEach((val) => {
        if (val && typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed) suggestions.add(trimmed);
        }
      });
    } catch (err) {
      // If a table or column does not exist in the current schema, skip it gracefully.
      const msg = String(err.message || '');
      if (
        msg.includes('ER_NO_SUCH_TABLE') ||
        msg.includes("doesn't exist") ||
        msg.includes('Unknown column')
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `[searchSuggestions] Skipping missing source ${table}.${column}: ${msg}`
        );
        continue;
      }
      throw err;
    }
  }

  // Return at most "limit" suggestions to keep payload small.
  const merged = Array.from(suggestions).slice(0, limit);

  return res.json({
    success: true,
    data: {
      field: fieldKey,
      suggestions: merged,
    },
  });
});


