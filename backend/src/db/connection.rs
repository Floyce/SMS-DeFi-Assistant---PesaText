use sqlx::postgres::{PgConnectOptions, PgPool};
use std::str::FromStr;

pub type DbPool = PgPool;

pub async fn establish_connection(database_url: &str) -> Result<DbPool, sqlx::Error> {
    let connection_options = PgConnectOptions::from_str(database_url)?;

    let pool = PgPool::connect_with(connection_options).await?;

    // Create users table
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

    // Create loans table using PostgreSQL SERIAL identity keys
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS loans (
            id SERIAL PRIMARY KEY,
            user_phone TEXT NOT NULL,
            principal_stroops BIGINT NOT NULL,
            interest_stroops BIGINT NOT NULL,
            status TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            due_at TEXT NOT NULL,
            FOREIGN KEY(user_phone) REFERENCES users(phone)
        );"
    )
    .execute(&pool)
    .await?;

    // Create transactions table using PostgreSQL SERIAL identity keys
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_phone TEXT NOT NULL,
            tx_type TEXT NOT NULL,
            amount_stroops BIGINT NOT NULL,
            status TEXT NOT NULL,
            reference_code TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_phone) REFERENCES users(phone)
        );"
    )
    .execute(&pool)
    .await?;

    // Create pending_deposits table using PostgreSQL SERIAL identity keys
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS pending_deposits (
            id SERIAL PRIMARY KEY,
            reference_code TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            amount_kes DOUBLE PRECISION NOT NULL,
            est_xlm DOUBLE PRECISION NOT NULL,
            created_at TEXT NOT NULL
        );"
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}
