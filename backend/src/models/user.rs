//! PesaText - User Model
//! File: user.rs
//! Description: Represents a registered user in PesaText
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    #[sqlx(default)]
    pub id: Option<i64>,
    pub phone: String,
    pub name: String,
    pub stellar_address: String,
    pub created_at: String,
}
