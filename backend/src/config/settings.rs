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
    pub africas_talking_api_key: String,
    pub africas_talking_username: String,
    pub africas_talking_shortcode: String,
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
            africas_talking_api_key: env::var("AFRICAS_TALKING_API_KEY")
                .unwrap_or_else(|_| "mock_api_key_placeholder".to_string()),
            africas_talking_username: env::var("AFRICAS_TALKING_USERNAME")
                .unwrap_or_else(|_| "sandbox".to_string()),
            africas_talking_shortcode: env::var("AFRICAS_TALKING_SHORTCODE")
                .unwrap_or_else(|_| "your_shortcode_here".to_string()),
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
