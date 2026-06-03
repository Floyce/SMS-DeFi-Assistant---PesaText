//! PesaText - Loan Model
//! File: loan.rs
//! Description: Represents a borrowing loan record in PesaText
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Loan {
    pub id: Option<i64>,
    pub user_phone: String,
    pub principal_stroops: i64,
    pub interest_stroops: i64,
    pub status: String, // Active, Repaid, Overdue
    pub issued_at: String,
    pub due_at: String,
}
