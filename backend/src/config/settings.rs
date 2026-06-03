// PesaText - Backend Config Settings
//! File: settings.rs
//! Description: Environment configuration loader
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use std::env;


#[derive(Clone, Debug)]
pub struct Settings {
    pub database_url: String,
    pub twilio_account_sid: String,
    pub twilio_auth_token: String,
    pub twilio_number: String,
    pub soroban_contract_id: String,
    pub stellar_rpc_url: String,
    pub server_port: u16,
}

impl Settings {
    pub fn new() -> Self {
        // Load env from .env if present
        let _ = dotenvy::dotenv();

        Settings {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://pesatext.db".to_string()),
            twilio_account_sid: env::var("TWILIO_ACCOUNT_SID")
                .unwrap_or_else(|_| "ACmock_account_sid_placeholder".to_string()),
            twilio_auth_token: env::var("TWILIO_AUTH_TOKEN")
                .unwrap_or_else(|_| "mock_auth_token_placeholder".to_string()),
            twilio_number: env::var("TWILIO_NUMBER")
                .unwrap_or_else(|_| "+15005550006".to_string()),
            soroban_contract_id: env::var("SOROBAN_CONTRACT_ID")
                .unwrap_or_else(|_| "CA3D27JOCYEL4EASYYMOCKCONTRACTID".to_string()),
            stellar_rpc_url: env::var("STELLAR_RPC_URL")
                .unwrap_or_else(|_| "https://soroban-testnet.stellar.org".to_string()),
            server_port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
        }
    }
}
