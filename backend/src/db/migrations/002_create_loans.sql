-- 002_create_loans.sql
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_phone TEXT NOT NULL,
    principal_stroops INTEGER NOT NULL,
    interest_stroops INTEGER NOT NULL,
    status TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    FOREIGN KEY(user_phone) REFERENCES users(phone)
);
