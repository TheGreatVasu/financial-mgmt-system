const TABLES = {
  customers: 'customers',
  masterProfile: 'customer_master_profiles',
  addresses: 'customer_addresses',
  contacts: 'customer_contacts',
  paymentTerms: 'customer_payment_terms',
  poEntries: 'po_entries'
}

async function ensureColumn(knex, tableName, columnName, callback) {
  const tableExists = await knex.schema.hasTable(tableName)
  if (!tableExists) {
    return // Table doesn't exist, skip column addition
  }
  const exists = await knex.schema.hasColumn(tableName, columnName)
  if (!exists) {
    await knex.schema.alterTable(tableName, callback)
  }
}

exports.up = async function up(knex) {
  await ensureColumn(knex, TABLES.customers, 'customer_address', (table) => {
    table.text('customer_address').nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'country', (table) => {
    table.string('country', 100).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'state', (table) => {
    table.string('state', 100).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'zone', (table) => {
    table.string('zone', 100).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'segment', (table) => {
    table.string('segment', 100).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'business_type', (table) => {
    table.string('business_type', 100).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'gst_number', (table) => {
    table.string('gst_number', 50).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'sales_manager', (table) => {
    table.string('sales_manager', 150).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'sales_head', (table) => {
    table.string('sales_head', 150).nullable()
  })
  await ensureColumn(knex, TABLES.customers, 'metadata', (table) => {
    table.json('metadata').nullable()
  })

  const hasMasterProfile = await knex.schema.hasTable(TABLES.masterProfile)
  if (!hasMasterProfile) {
    await knex.schema.createTable(TABLES.masterProfile, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('customer_id').unsigned().notNullable()
      table.string('company_name', 191).notNullable()
      table.string('legal_entity_name', 191).notNullable()
      table.text('corporate_office').nullable()
      table.text('marketing_office').nullable()
      table.text('correspondence_address').nullable()
      table.json('gst_numbers').nullable()
      table.json('metadata').nullable()
      table.timestamps(true, true)
      table
        .foreign('customer_id')
        .references('id')
        .inTable(TABLES.customers)
        .onDelete('CASCADE')
    })
  }

  const hasAddresses = await knex.schema.hasTable(TABLES.addresses)
  if (!hasAddresses) {
    await knex.schema.createTable(TABLES.addresses, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('customer_id').unsigned().notNullable()
      table
        .enum('address_type', ['site_office', 'plant'])
        .notNullable()
        .defaultTo('site_office')
      table.string('label', 120).nullable()
      table.text('address_line').nullable()
      table.string('contact_number', 50).nullable()
      table.string('gst_number', 50).nullable()
      table.timestamps(true, true)
      table
        .foreign('customer_id')
        .references('id')
        .inTable(TABLES.customers)
        .onDelete('CASCADE')
    })
  }

  const hasContacts = await knex.schema.hasTable(TABLES.contacts)
  if (!hasContacts) {
    await knex.schema.createTable(TABLES.contacts, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('customer_id').unsigned().notNullable()
      table
        .enum('contact_role', [
          'primary',
          'customer_contact',
          'sales_manager',
          'sales_head',
          'business_head',
          'collection_incharge',
          'sales_agent',
          'collection_agent',
          'custom'
        ])
        .notNullable()
        .defaultTo('custom')
      table.string('name', 191).nullable()
      table.string('email', 191).nullable()
      table.string('phone', 50).nullable()
      table.string('department', 120).nullable()
      table.string('designation', 120).nullable()
      table.string('job_role', 120).nullable()
      table.string('segment', 120).nullable()
      table.json('metadata').nullable()
      table.timestamps(true, true)
      table
        .foreign('customer_id')
        .references('id')
        .inTable(TABLES.customers)
        .onDelete('CASCADE')
    })
  }

  const hasPaymentTerms = await knex.schema.hasTable(TABLES.paymentTerms)
  if (!hasPaymentTerms) {
    await knex.schema.createTable(TABLES.paymentTerms, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('customer_id').unsigned().notNullable()
      table.string('title', 191).notNullable()
      table.string('term_type', 120).nullable()
      table.integer('credit_days').nullable()
      table.string('applicable_for', 191).nullable()
      table.text('description').nullable()
      table.json('metadata').nullable()
      table.timestamps(true, true)
      table
        .foreign('customer_id')
        .references('id')
        .inTable(TABLES.customers)
        .onDelete('CASCADE')
    })
  }

  await ensureColumn(knex, TABLES.poEntries, 'tender_reference_no', (table) => {
    table.string('tender_reference_no', 120).nullable()
  })
}

exports.down = async function down(knex) {
  if (await knex.schema.hasTable(TABLES.paymentTerms)) {
    await knex.schema.dropTableIfExists(TABLES.paymentTerms)
  }
  if (await knex.schema.hasTable(TABLES.contacts)) {
    await knex.schema.dropTableIfExists(TABLES.contacts)
  }
  if (await knex.schema.hasTable(TABLES.addresses)) {
    await knex.schema.dropTableIfExists(TABLES.addresses)
  }
  if (await knex.schema.hasTable(TABLES.masterProfile)) {
    await knex.schema.dropTableIfExists(TABLES.masterProfile)
  }

  const dropColumn = async (tableName, columnName) => {
    const tableExists = await knex.schema.hasTable(tableName)
    if (!tableExists) {
      return // Table doesn't exist, skip column removal
    }
    const exists = await knex.schema.hasColumn(tableName, columnName)
    if (exists) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn(columnName)
      })
    }
  }

  await dropColumn(TABLES.customers, 'customer_address')
  await dropColumn(TABLES.customers, 'country')
  await dropColumn(TABLES.customers, 'state')
  await dropColumn(TABLES.customers, 'zone')
  await dropColumn(TABLES.customers, 'segment')
  await dropColumn(TABLES.customers, 'business_type')
  await dropColumn(TABLES.customers, 'gst_number')
  await dropColumn(TABLES.customers, 'sales_manager')
  await dropColumn(TABLES.customers, 'sales_head')
  await dropColumn(TABLES.customers, 'metadata')
  await dropColumn(TABLES.poEntries, 'tender_reference_no')
}


