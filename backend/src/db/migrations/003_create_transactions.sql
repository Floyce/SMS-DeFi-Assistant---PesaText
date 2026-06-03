-- 003_create_transactions.sql
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_phone TEXT NOT NULL,
    tx_type TEXT NOT NULL,
    amount_stroops INTEGER NOT NULL,
    status TEXT NOT NULL,
    reference_code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_phone) REFERENCES users(phone)
);
