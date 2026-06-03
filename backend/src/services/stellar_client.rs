//! PesaText - Stellar Client
//! File: stellar_client.rs
//! Description: Interface with Stellar/Soroban smart contract
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use crate::config::Settings;
use std::collections::HashMap;
use std::sync::Mutex;
use log::info;

// A simple in-memory thread-safe mock ledger for testing and local dashboard simulation
lazy_static::lazy_static! {
    static ref CONTRACT_STATE: Mutex<HashMap<String, ContractState>> = Mutex::new(HashMap::new());
}

#[derive(Clone, Debug)]
struct ContractState {
    pub name: String,
    pub balance_stroops: i128,
    pub loan_principal: i128,
    pub loan_interest: i128,
}

pub struct StellarClient {
    pub contract_id: String,
    pub rpc_url: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct SorobanTxResult {
    pub tx_hash: String,
    pub status: String,
    pub balance_stroops: i128,
    pub loan_due_stroops: i128,
}

impl StellarClient {
    pub fn new(settings: &Settings) -> Self {
        StellarClient {
            contract_id: settings.soroban_contract_id.clone(),
            rpc_url: settings.stellar_rpc_url.clone(),
        }
    }

    /// Simulates/Executes Soroban registration: `register(user_phone, user_name)`
    pub async fn register(&self, phone: &str, name: &str) -> Result<SorobanTxResult, String> {
        info!("Soroban RPC: Invoking `register` on contract {} for phone {}", self.contract_id, phone);
        
        let mut state = CONTRACT_STATE.lock().unwrap();
        if state.contains_key(phone) {
            return Err("UserAlreadyExists".to_string());
        }

        state.insert(
            phone.to_string(),
            ContractState {
                name: name.to_string(),
                balance_stroops: 0,
                loan_principal: 0,
                loan_interest: 0,
            },
        );

        let tx_hash = format!("tx_{}", md5::compute(format!("{}_register", phone)));
        Ok(SorobanTxResult {
            tx_hash,
            status: "Success".to_string(),
            balance_stroops: 0,
            loan_due_stroops: 0,
        })
    }

    /// Simulates/Executes Soroban deposit: `deposit(user_phone, amount)`
    pub async fn deposit(&self, phone: &str, amount_stroops: i128) -> Result<SorobanTxResult, String> {
        info!("Soroban RPC: Invoking `deposit` of {} stroops for phone {}", amount_stroops, phone);

        let mut state = CONTRACT_STATE.lock().unwrap();
        let user_state = state.get_mut(phone).ok_or("UserNotFound".to_string())?;

        user_state.balance_stroops += amount_stroops;

        let tx_hash = format!("tx_{}", md5::compute(format!("{}_deposit_{}", phone, amount_stroops)));
        Ok(SorobanTxResult {
            tx_hash,
            status: "Success".to_string(),
            balance_stroops: user_state.balance_stroops,
            loan_due_stroops: user_state.loan_principal + user_state.loan_interest,
        })
    }

    /// Simulates/Executes Soroban loan: `borrow(user_phone, amount)`
    pub async fn borrow(&self, phone: &str, amount_stroops: i128) -> Result<SorobanTxResult, String> {
        info!("Soroban RPC: Invoking `borrow` of {} stroops for phone {}", amount_stroops, phone);

        let mut state = CONTRACT_STATE.lock().unwrap();
        let user_state = state.get_mut(phone).ok_or("UserNotFound".to_string())?;

        if user_state.loan_principal > 0 {
            return Err("ActiveLoanExists".to_string());
        }

        let interest = amount_stroops * 5 / 100;
        user_state.loan_principal = amount_stroops;
        user_state.loan_interest = interest;
        user_state.balance_stroops += amount_stroops; // Borrowed money credited to balance

        let tx_hash = format!("tx_{}", md5::compute(format!("{}_borrow_{}", phone, amount_stroops)));
        Ok(SorobanTxResult {
            tx_hash,
            status: "Success".to_string(),
            balance_stroops: user_state.balance_stroops,
            loan_due_stroops: user_state.loan_principal + user_state.loan_interest,
        })
    }

    /// Simulates/Executes Soroban repayment: `repay(user_phone, amount)`
    pub async fn repay(&self, phone: &str, amount_stroops: i128) -> Result<SorobanTxResult, String> {
        info!("Soroban RPC: Invoking `repay` of {} stroops for phone {}", amount_stroops, phone);

        let mut state = CONTRACT_STATE.lock().unwrap();
        let user_state = state.get_mut(phone).ok_or("UserNotFound".to_string())?;

        let total_due = user_state.loan_principal + user_state.loan_interest;
        if total_due == 0 {
            return Err("NoActiveLoan".to_string());
        }

        if amount_stroops >= total_due {
            // Repaid in full
            user_state.loan_principal = 0;
            user_state.loan_interest = 0;
            let excess = amount_stroops - total_due;
            user_state.balance_stroops += excess;
        } else {
            // Partial repayment
            let mut remaining = amount_stroops;
            if remaining >= user_state.loan_interest {
                remaining -= user_state.loan_interest;
                user_state.loan_interest = 0;
            } else {
                user_state.loan_interest -= remaining;
                remaining = 0;
            }
            user_state.loan_principal -= remaining;
        }

        let tx_hash = format!("tx_{}", md5::compute(format!("{}_repay_{}", phone, amount_stroops)));
        Ok(SorobanTxResult {
            tx_hash,
            status: "Success".to_string(),
            balance_stroops: user_state.balance_stroops,
            loan_due_stroops: user_state.loan_principal + user_state.loan_interest,
        })
    }

    /// Fetches details from Soroban
    pub async fn get_balance(&self, phone: &str) -> Result<i128, String> {
        let state = CONTRACT_STATE.lock().unwrap();
        let user_state = state.get(phone).ok_or("UserNotFound".to_string())?;
        Ok(user_state.balance_stroops)
    }

    pub async fn get_loan_due(&self, phone: &str) -> Result<i128, String> {
        let state = CONTRACT_STATE.lock().unwrap();
        let user_state = state.get(phone).ok_or("UserNotFound".to_string())?;
        Ok(user_state.loan_principal + user_state.loan_interest)
    }
}
pub mod md5 {
    pub fn compute(val: String) -> String {
        // Mock MD5 hash generator
        let mut h = 0u64;
        for c in val.chars() {
            h = h.wrapping_add(c as u64).wrapping_mul(31);
        }
        format!("{:016x}", h)
    }
}
