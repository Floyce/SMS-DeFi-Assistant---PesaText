//! PesaText - Backend DB Module
//! File: mod.rs
//! Description: Exposes database connection and repository modules
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

pub mod connection;
pub mod user_repo;
pub mod transaction_repo;
pub mod deposit_repo;

pub use connection::DbPool;
