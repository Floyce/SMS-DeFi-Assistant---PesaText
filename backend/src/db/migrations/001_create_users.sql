CREATE TABLE IF NOT EXISTS users (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stellar_address TEXT NOT NULL,
    created_at TEXT NOT NULL
);
