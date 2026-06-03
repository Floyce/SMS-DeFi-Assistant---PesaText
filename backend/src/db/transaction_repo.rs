//! PesaText - Backend API
//! File: transaction_repo.rs
//! Description: Repository for transaction CRUD operations
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use crate::db::DbPool;
use crate::models::transaction::Transaction;

/// List all transactions
pub async fn list_transactions(pool: &DbPool) -> Result<Vec<Transaction>, sqlx::Error> {
    sqlx::query_as::<_, Transaction>(
        "SELECT id, user_phone, tx_type, amount_stroops, status, reference_code, created_at FROM transactions"
    )
    .fetch_all(pool)
    .await
}

/// Create a new transaction record
pub async fn create_transaction(pool: &DbPool, tx: &Transaction) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO transactions (user_phone, tx_type, amount_stroops, status, reference_code, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&tx.user_phone)
    .bind(&tx.tx_type)
    .bind(tx.amount_stroops)
    .bind(&tx.status)
    .bind(&tx.reference_code)
    .bind(&tx.created_at)
    .execute(pool)
    .await?;
    Ok(())
}
