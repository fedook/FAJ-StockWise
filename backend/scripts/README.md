# Record codes and seed-data cleanup

FAJ Stockwise displays stable human-readable codes in the Customers, Suppliers,
and Products tables:

- Customers: `CUST-00001`
- Suppliers: `SUP-00001`
- Products: `SKU-00001`

These codes are derived from each record's existing PostgreSQL `serial` ID.
They are not editable names and do not require a new database column or
migration. New records automatically receive the next database ID, so the
code appears as soon as the API returns the created record. Deleted IDs are
not reused by PostgreSQL.

## Existing Neon data

If your current demo names still contain prefixes such as `Customer 47 -`,
`Seed Supplier 02 -`, or supplier emails beginning with `seed.`, run
`normalize-seed-record-names.sql` once in the Neon SQL Editor.

The script only normalizes text fields. It does not delete records, reset
sequences, change primary keys, or modify sales/product relationships.

## Future seed runs

The demo seeder now creates plain customer and supplier names and ordinary
supplier email addresses. It no longer puts seed labels into business names.
