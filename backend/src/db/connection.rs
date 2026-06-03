use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::str::FromStr;

pub type DbPool = SqlitePool;

pub async fn establish_connection(database_url: &str) -> Result<DbPool, sqlx::Error> {
    let connection_options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(connection_options).await?;

    // Run simple schema migration
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            phone TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            stellar_address TEXT NOT NULL,
            created_at TEXT NOT NULL
        );"
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_phone TEXT NOT NULL,
            principal_stroops INTEGER NOT NULL,
            interest_stroops INTEGER NOT NULL,
            status TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            due_at TEXT NOT NULL,
            FOREIGN KEY(user_phone) REFERENCES users(phone)
        );"
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_phone TEXT NOT NULL,
            tx_type TEXT NOT NULL,
            amount_stroops INTEGER NOT NULL,
            status TEXT NOT NULL,
            reference_code TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_phone) REFERENCES users(phone)
        );"
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS pending_deposits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_code TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            amount_kes REAL NOT NULL,
            est_xlm REAL NOT NULL,
            created_at TEXT NOT NULL
        );"
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}
