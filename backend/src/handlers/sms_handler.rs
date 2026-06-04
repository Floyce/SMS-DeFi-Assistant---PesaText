//! PesaText - SMS Handler
//! File: sms_handler.rs
//! Description: Handle Twilio SMS webhooks and execute commands
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-04

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

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
pub struct TwilioSmsRequest {
    pub message_sid: Option<String>,
    pub from: String,
    pub body: String,
}

pub async fn handle_sms(
    pool: web::Data<DbPool>,
    settings: web::Data<Settings>,
    form: web::Form<TwilioSmsRequest>,
) -> impl Responder {
    let raw_phone = &form.from;
    let formatted_phone = phone_formatter::format_phone(raw_phone);
    let msg_body = &form.body;

    let parsed_cmd = sms_parser::parse_message(msg_body);
    let stellar_client = StellarClient::new(settings.get_ref());

    let reply_msg = match parsed_cmd {
        SmsCommand::Register(name) => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => "PesaText: You are already registered under this phone number.".to_string(),
                Ok(None) => {
                    match stellar_client.register(&formatted_phone, &name).await {
                        Ok(res) => {
                            let stellar_address = format!(
                                "G{}",
                                &res.tx_hash[0..std::cmp::min(55, res.tx_hash.len())].to_uppercase()
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
                                "PesaText: Registration successful! Welcome, {}. Your Stellar wallet has been created. Send HELP to see options.",
                                name
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
                    let mock_mpesa_ref = format!("MP{}", form.message_sid.clone().unwrap_or_else(|| "mock_sid".to_string())[0..8].to_uppercase());

                    let _ = deposit_repo::create_pending_deposit(
                        pool.get_ref(),
                        &mock_mpesa_ref,
                        &formatted_phone,
                        kes_amount,
                        est_xlm,
                        &Local::now().to_rfc3339()
                    ).await;

                    format!(
                        "PesaText Save: Request logged. Please send {:.2} KES to Paybill 545454 with Account number {}. Reference code: {}.",
                        kes_amount, formatted_phone, mock_mpesa_ref
                    )
                }
                Ok(None) => "PesaText: Registration required. Text REGISTER [Name] to open an account.".to_string(),
                Err(_) => "PesaText: Database save error.".to_string(),
            }
        }
        SmsCommand::Borrow(kes_amount) => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => {
                    match deposit_repo::get_active_loan(pool.get_ref(), &formatted_phone).await {
                        Ok(Some(active_loan)) => {
                            let loan_xlm = currency_converter::stroops_to_xlm((active_loan.principal_stroops + active_loan.interest_stroops).into());
                            let loan_kes = currency_converter::xlm_to_kes(loan_xlm);
                            format!(
                                "PesaText Loan: Denied. You have an active loan of {:.2} KES (~{:.2} XLM) due. Please repay first.",
                                loan_kes, loan_xlm
                            )
                        }
                        Ok(None) => {
                            let requested_xlm = currency_converter::kes_to_xlm(kes_amount);
                            let requested_stroops = currency_converter::xlm_to_stroops(requested_xlm);

                            match stellar_client.borrow(&formatted_phone, requested_stroops).await {
                                Ok(res) => {
                                    let calc = loan_service::calculate_loan(requested_stroops.try_into().unwrap_or(i64::MAX));
                                    let new_loan = Loan {
                                        id: None,
                                        user_phone: formatted_phone.clone(),
                                        principal_stroops: calc.principal_stroops as i64,
                                        interest_stroops: calc.interest_stroops as i64,
                                        status: "Active".to_string(),
                                        issued_at: calc.issued_at,
                                        due_at: calc.due_at,
                                    };

                                    let tx = Transaction {
                                        id: None,
                                        user_phone: formatted_phone.clone(),
                                        tx_type: "Loan".to_string(),
                                        amount_stroops: requested_stroops as i64,
                                        status: "Success".to_string(),
                                        reference_code: res.tx_hash,
                                        created_at: Local::now().to_rfc3339(),
                                    };

                                    let _ = deposit_repo::create_loan(pool.get_ref(), &new_loan).await;
                                    let _ = deposit_repo::create_transaction(pool.get_ref(), &tx).await;

                                    let due_kes = currency_converter::xlm_to_kes(currency_converter::stroops_to_xlm(calc.total_due_stroops.into()));
                                    format!(
                                        "PesaText Loan: Approved! {:.2} KES (~{:.2} XLM) credited. Total due in 30 days: {:.2} KES (5% interest).",
                                        kes_amount, requested_xlm, due_kes
                                    )
                                }
                                Err(e) => format!("PesaText Loan: Soroban execution failed ({}).", e),
                            }
                        }
                        Err(_) => "PesaText: Database verification failed.".to_string(),
                    }
                }
                Ok(None) => "PesaText: Registration required first. Text REGISTER [Name].".to_string(),
                Err(_) => "PesaText: Database query error.".to_string(),
            }
        }
        SmsCommand::Repay(kes_amount) => {
            match user_repo::get_user(pool.get_ref(), &formatted_phone).await {
                Ok(Some(_)) => {
                    match deposit_repo::get_active_loan(pool.get_ref(), &formatted_phone).await {
                        Ok(Some(active_loan)) => {
                            let repay_xlm = currency_converter::kes_to_xlm(kes_amount);
                            let repay_stroops = currency_converter::xlm_to_stroops(repay_xlm);

                            match stellar_client.get_balance(&formatted_phone).await {
                                Ok(balance) if balance >= repay_stroops => {
                                    match stellar_client.repay(&formatted_phone, repay_stroops).await {
                                        Ok(res) => {
                                            let remaining_due_stroops = res.loan_due_stroops;
                                            
                                            if remaining_due_stroops == 0 {
                                                let _ = deposit_repo::update_loan_status(pool.get_ref(), active_loan.id.unwrap(), "Repaid").await;
                                            } else {
                                                let _ = sqlx::query("UPDATE loans SET principal_stroops = ? WHERE id = ?")
                                                    .bind(remaining_due_stroops as i64)
                                                    .bind(active_loan.id.unwrap())
                                                    .execute(pool.get_ref())
                                                    .await;
                                            }

                                            let tx = Transaction {
                                                id: None,
                                                user_phone: formatted_phone.clone(),
                                                tx_type: "Repay".to_string(),
                                                amount_stroops: repay_stroops as i64,
                                                status: "Success".to_string(),
                                                reference_code: res.tx_hash,
                                                created_at: Local::now().to_rfc3339(),
                                            };

                                            let _ = deposit_repo::create_transaction(pool.get_ref(), &tx).await;

                                            let remaining_kes = currency_converter::xlm_to_kes(currency_converter::stroops_to_xlm(remaining_due_stroops));
                                            format!(
                                                "PesaText Repayment: Repaid {:.2} KES from savings. Outstanding loan due: {:.2} KES. Thank you!",
                                                kes_amount, remaining_kes
                                            )
                                        }
                                        Err(e) => format!("PesaText Repay: Blockchain repayment failed ({}).", e),
                                    }
                                }
                                _ => "PesaText: Insufficient savings balance to make repayment. Please deposit/save funds first.".to_string(),
                            }
                        }
                        Ok(None) => "PesaText Repay: You do not have an active loan to repay.".to_string(),
                        Err(_) => "PesaText: Database lookup failed.".to_string(),
                    }
                }
                Ok(None) => "PesaText: You are not registered.".to_string(),
                Err(_) => "PesaText: System error occurred.".to_string(),
            }
        }
        SmsCommand::Help => {
            "PesaText commands:\nREGISTER [Name] - Register account\nBALANCE - Check balance & loans\nSAVE [KES] - Save XLM\nBORROW [KES] - Borrow (5% interest, 30 days)\nREPAY [KES] - Repay loan from savings\nHELP - Show commands".to_string()
        }
        SmsCommand::Unknown(msg) => {
            format!("PesaText: {} Send HELP for commands list.", msg)
        }
    };

    let twiml = format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n    <Message>{}</Message>\n</Response>",
        reply_msg
    );

    HttpResponse::Ok()
        .content_type("application/xml")
        .body(twiml)
}