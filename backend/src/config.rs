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
    pub africas_talking_api_key: String,
    pub africas_talking_username: String,
    pub africas_talking_shortcode: String,
    pub soroban_contract_id: String,
    pub stellar_rpc_url: String,
    pub port: u16,
}

impl Settings {
    pub fn new() -> Self {
        Self::from_env()
    }

    pub fn from_env() -> Self {
        dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://pesatext.db".to_string()),
            africas_talking_api_key: env::var("AFRICAS_TALKING_API_KEY").expect("AFRICAS_TALKING_API_KEY not set"),
            africas_talking_username: env::var("AFRICAS_TALKING_USERNAME").expect("AFRICAS_TALKING_USERNAME not set"),
            africas_talking_shortcode: env::var("AFRICAS_TALKING_SHORTCODE").expect("AFRICAS_TALKING_SHORTCODE not set"),
            soroban_contract_id: env::var("SOROBAN_CONTRACT_ID").expect("SOROBAN_CONTRACT_ID not set"),
            stellar_rpc_url: env::var("STELLAR_RPC_URL").unwrap_or_else(|_| "https://soroban-testnet.stellar.org".to_string()),
            port: env::var("PORT").unwrap_or_else(|_| "8000".to_string()).parse().expect("PORT must be a number"),
        }
    }
}