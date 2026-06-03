-- 004_create_pending_deposits.sql
CREATE TABLE IF NOT EXISTS pending_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_code TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    amount_kes REAL NOT NULL,
    est_xlm REAL NOT NULL,
    created_at TEXT NOT NULL
);
