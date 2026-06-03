//! PesaText - Transaction Model
//! File: transaction.rs
//! Description: Represents a system transaction record in PesaText
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: Option<i64>,
    pub user_phone: String,
    pub tx_type: String, // Register, Deposit, Loan, Repay
    pub amount_stroops: i64,
    pub status: String, // Success, Pending, Failed
    pub reference_code: String, // Twilio SMS SID, M-Pesa ID or Stellar Tx Hash
    pub created_at: String,
}
