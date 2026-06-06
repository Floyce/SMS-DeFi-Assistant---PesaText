//! PesaText - Africa's Talking SMS Handler
//! File: sms_handler.rs
//! Description: Handle Africa's Talking SMS webhooks and execute commands
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-05

use actix_web::{web, HttpResponse, Responder};
use crate::db::DbPool;
use crate::config::Settings;
use crate::utils::{phone_formatter, currency_converter};
use crate::services::sms_parser::{self, SmsCommand};
use crate::services::stellar_client::StellarClient;
use crate::services::loan_service;
use crate::db::{user_repo, deposit_repo};
use crate::models::user::User;
use crate::models::loan::Loan;
use crate::models::transaction::Transaction;
use serde::Deserialize;
use chrono::Local;
use std::collections::HashMap;
use std::cmp::min;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AfricasTalkingSmsRequest {
    pub id: String,
    pub from: String,
    pub to: String,
    pub text: String,
    pub date: String,
}

pub async fn send_at_sms(api_key: &str, username: &str, to_phone: &str, message_text: &str) -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let mut form_data = HashMap::new();
    form_data.insert("username", username);
    form_data.insert("to", to_phone);
    form_data.insert("message", message_text);

    let url = "https://africastalking.com";
    
    let response = client
        .post(url)
        .header("ApiKey", api_key)
        .header("Accept", "application/json")
        .form(&form_data)
        .send()
        .await?;

    if response.status().is_success() {
        println!("🚀 PesaText SMS alert successfully pushed to {}!", to_phone);
    } else {
        println!("❌ Africa's Talking API Error: {:?}", response.text().await?);
    }

    Ok(())
}

pub async fn handle_sms(
    pool: web::Data<DbPool>,
    settings: web::Data<Settings>,
    form: web::Form<AfricasTalkingSmsRequest>,
) -> impl Responder {
    let raw_phone = &form.from;
    let formatted_phone = phone_formatter::format_phone(raw_phone);
    let msg_body = &form.text;

    let parsed_cmd = sms_parser::parse_message(msg_body);
    let stellar_client = StellarClient::new(settings.get_ref());

    let at_api_key = std::env::var("AFRICASTALKING_API_KEY").unwrap_or_default();
    let at_username = std::env::var("AFRICASTALKING_USERNAME").unwrap_or_else(|_| "sandbox".to_string());

    let reply_msg = match parsed_cmd {
        SmsCommand::Register(name) => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => "PesaText: You are already registered under this phone number.".to_string(),
                Ok(None) => {
                    match stellar_client.register(&formatted_phone, &name).await {
                        Ok(res) => {
                            let stellar_address = format!(
                                "G{}",
                                &res.tx_hash[0..min(55, res.tx_hash.len())].to_uppercase()
                            );
                            
                            let new_user = User {
                                id: None,
                                phone: formatted_phone.clone(),
                                name: name.clone(),
                                stellar_address: stellar_address.clone(),
                                created_at: Local::now().to_rfc3339(),
                            };

                            let tx = Transaction {
                                id: None,
                                user_phone: formatted_phone.clone(),
                                tx_type: "Register".to_string(),
                                amount_stroops: 0,
                                status: "Success".to_string(),
                                reference_code: res.tx_hash,
                                created_at: Local::now().to_rfc3339(),
                            };

                            let _ = user_repo::create_user(pool.get_ref(), &new_user).await;
                            let _ = deposit_repo::create_transaction(pool.get_ref(), &tx).await;

                            format!(
                                "PesaText: Registration successful! Welcome, {}. Your Stellar wallet has been created (Address: {}). Send HELP to see options.",
                                name, stellar_address
                            )
                        }
                        Err(e) => format!("PesaText: Blockchain registration failed ({}).", e),
                    }
                }
                Err(_) => "PesaText: Database error occurred.".to_string(),
            }
        }
        SmsCommand::Balance => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => {
                    let bal_res = stellar_client.get_balance(&formatted_phone).await;
                    let loan_res = stellar_client.get_loan_due(&formatted_phone).await;

                    match (bal_res, loan_res) {
                        (Ok(bal_stroops), Ok(loan_stroops)) => {
                            let bal_xlm = currency_converter::stroops_to_xlm(bal_stroops);
                            let loan_xlm = currency_converter::stroops_to_xlm(loan_stroops);

                            let bal_kes = currency_converter::xlm_to_kes(bal_xlm);
                            let loan_kes = currency_converter::xlm_to_kes(loan_xlm);

                            format!(
                                "PesaText Balance:\nSavings: {:.2} XLM (~{:.2} KES)\nActive Loan Due: {:.2} XLM (~{:.2} KES)",
                                bal_xlm, bal_kes, loan_xlm, loan_kes
                            )
                        }
                        _ => "PesaText: Failed to retrieve balance from Stellar blockchain.".to_string(),
                    }
                }
                Ok(None) => "PesaText: You are not registered. Reply with REGISTER [Name] to create an account.".to_string(),
                Err(_) => "PesaText: System error occurred.".to_string(),
            }
        }
                SmsCommand::Save(kes_amount) => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => {
                    let est_xlm = currency_converter::kes_to_xlm(kes_amount);
                    let mock_mpesa_ref = format!("MP{}", &form.id[0..min(8, form.id.len())].to_uppercase());

                    let _ = deposit_repo::create_pending_deposit(
                        pool.get_ref(),
                        &mock_mpesa_ref,
                        &formatted_phone,
                        kes_amount,
                        est_xlm,
                        &Local::now().to_rfc3339()
                    ).await;

                    format!(
                        "PesaText Save: Request logged. Please send {:.2} KES to Paybill 545454 with Account number {}. Reference code: {}. Once M-Pesa clears, your XLM will be released.",
                        kes_amount, formatted_phone, mock_mpesa_ref
                    )
                }
                Ok(None) => "PesaText: Registration required. Text REGISTER [Name] to open an account.".to_string(),
                Err(_) => "PesaText: Database save error.".to_string(),
            }
        }
        SmsCommand::Borrow(_kes_amount) => {
            "PesaText Loan: The loan feature is temporarily offline for maintenance.".to_string()
        }
        SmsCommand::Repay(_kes_amount) => {
            "PesaText Repay: To repay, please send funds to Paybill 545454.".to_string()
        }
        SmsCommand::Help => {
            "PesaText Help:\nUse commands:\n- REGISTER [Name]\n- BALANCE\n- SAVE [Amount]\n- BORROW [Amount]".to_string()
        }
        SmsCommand::Unknown(_msg) => {
            "PesaText: Command not recognized. Text HELP to see valid options.".to_string()
        }
    };

    let _ = send_at_sms(&at_api_key, &at_username, raw_phone, &reply_msg).await;

    HttpResponse::Ok().body("SMS Processed")
}
