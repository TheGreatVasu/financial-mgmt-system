const { asyncHandler } = require('../middlewares/errorHandler');
const { getSheetValues, updateSheetValues } = require('../services/googleSheetsService');

// GET /api/google-sheets/values?spreadsheetId=...&range=...
const getValues = asyncHandler(async (req, res) => {
	const spreadsheetId = (req.query.spreadsheetId || '').trim();
	const range = (req.query.range || '').trim();
	const userId = req.user?.id;

	if (!userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	if (!spreadsheetId || !range) {
		return res.status(400).json({ success: false, message: 'spreadsheetId and range are required' });
	}

	const data = await getSheetValues(userId, spreadsheetId, range);
	return res.json({ success: true, data });
});

// PUT /api/google-sheets/values
// body: { spreadsheetId, range, values, valueInputOption? }
const putValues = asyncHandler(async (req, res) => {
	const spreadsheetId = (req.body.spreadsheetId || '').trim();
	const range = (req.body.range || '').trim();
	const values = req.body.values;
	const valueInputOption = req.body.valueInputOption || 'RAW';
	const userId = req.user?.id;

	if (!userId) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	if (!spreadsheetId || !range) {
		return res.status(400).json({ success: false, message: 'spreadsheetId and range are required' });
	}
	if (!Array.isArray(values)) {
		return res.status(400).json({ success: false, message: 'values must be an array of arrays' });
	}

	const data = await updateSheetValues(userId, spreadsheetId, range, values, valueInputOption);
	return res.json({ success: true, data });
});

module.exports = {
	getValues,
	putValues
};


