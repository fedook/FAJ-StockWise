-- One-time cleanup for existing FAJ Stockwise demo records.
-- Safe to run in Neon SQL Editor: this only normalizes text; it does not
-- delete rows, change primary keys, or modify sales/product relationships.

UPDATE customers
SET name = regexp_replace(name, '^(Seed )?Customer [0-9]+ - ', '')
WHERE name ~ '^(Seed )?Customer [0-9]+ - ';

UPDATE suppliers
SET name = regexp_replace(name, '^(Seed )?Supplier [0-9]+ - ', '')
WHERE name ~ '^(Seed )?Supplier [0-9]+ - ';

UPDATE suppliers
SET contact_information = regexp_replace(contact_information, '^seed[.]', '')
WHERE contact_information ~ '^seed[.]';

-- The UI now displays stable CUST-00001 / SUP-00001 / SKU-00001 codes
-- derived from each row's existing database ID. No schema migration is needed.
