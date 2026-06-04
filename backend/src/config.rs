//! PesaText - Configuration Module
//! File: config.rs
//! Description: Application configuration from environment variables
//! Author: Floyce
//! Created: 2026-06-04

use dotenvy::dotenv;
use std::env;

#[derive(Debug, Clone)]
pub struct Settings {
    pub database_url: String,
    pub twilio_account_sid: String,
    pub twilio_auth_token: String,
    pub twilio_number: String,
    pub soroban_contract_id: String,
    pub stellar_rpc_url: String,
    pub port: u16,
}

impl Settings {
    pub fn from_env() -> Self {
        dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://pesatext.db".to_string()),
            twilio_account_sid: env::var("TWILIO_ACCOUNT_SID").expect("TWILIO_ACCOUNT_SID not set"),
            twilio_auth_token: env::var("TWILIO_AUTH_TOKEN").expect("TWILIO_AUTH_TOKEN not set"),
            twilio_number: env::var("TWILIO_NUMBER").expect("TWILIO_NUMBER not set"),
            soroban_contract_id: env::var("SOROBAN_CONTRACT_ID").expect("SOROBAN_CONTRACT_ID not set"),
            stellar_rpc_url: env::var("STELLAR_RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".to_string()),
            port: env::var("PORT").unwrap_or_else(|_| "8000".to_string()).parse().expect("PORT must be a number"),
        }
    }
}