// PesaText - Backend Admin Handler
//! File: admin_handler.rs
//! Description: Admin API endpoint implementations
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use actix_web::{web, HttpResponse, Responder};
use crate::db::DbPool;
use crate::config::Settings;
use crate::utils::{phone_formatter, currency_converter};
use crate::services::stellar_client::StellarClient;
use crate::db::{user_repo, deposit_repo};
use crate::models::user::User;
use crate::models::transaction::Transaction;
use serde::{Deserialize, Serialize};
use chrono::Local;

#[derive(Deserialize)]
pub struct ConfirmDepositRequest {
    pub reference_code: String,
}

#[derive(Deserialize)]
pub struct ManualRepayRequest {
    pub phone: String,
    pub amount_kes: f64,
}

#[derive(Deserialize)]
pub struct InviteUserRequest {
    pub phone: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct AdminDashboardStats {
    pub total_users: usize,
    pub total_deposits_xlm: f64,
    pub active_loans_count: usize,
    pub total_volume_kes: f64,
}

/// GET /api/admin/stats
pub async fn get_stats(pool: web::Data<DbPool>) -> impl Responder {
    let users = user_repo::list_users(pool.get_ref()).await.unwrap_or_default();
    let txs = deposit_repo::list_transactions(pool.get_ref()).await.unwrap_or_default();
    let loans = deposit_repo::list_loans(pool.get_ref()).await.unwrap_or_default();

    let active_loans = loans.iter().filter(|l| l.status == "Active").count();
    
    let mut total_deposits_xlm = 0.0;
    let mut total_volume_kes = 0.0;

    for tx in txs {
        let xlm = currency_converter::stroops_to_xlm(tx.amount_stroops as i128);
        let kes = currency_converter::xlm_to_kes(xlm);
        total_volume_kes += kes;

        if tx.tx_type == "Deposit" && tx.status == "Success" {
            total_deposits_xlm += xlm;
        }
    }

    HttpResponse::Ok().json(AdminDashboardStats {
        total_users: users.len(),
        total_deposits_xlm,
        active_loans_count: active_loans,
        total_volume_kes,
    })
}

/// GET /api/admin/users
pub async fn get_users(pool: web::Data<DbPool>) -> impl Responder {
    match user_repo::list_users(pool.get_ref()).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

/// GET /api/admin/transactions
pub async fn get_transactions(pool: web::Data<DbPool>) -> impl Responder {
    match deposit_repo::list_transactions(pool.get_ref()).await {
        Ok(txs) => HttpResponse::Ok().json(txs),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

/// GET /api/admin/deposits/pending
pub async fn get_pending_deposits(pool: web::Data<DbPool>) -> impl Responder {
    match deposit_repo::list_pending_deposits(pool.get_ref()).await {
        Ok(deposits) => HttpResponse::Ok().json(deposits),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

/// GET /api/admin/loans
pub async fn get_loans(pool: web::Data<DbPool>) -> impl Responder {
    match deposit_repo::list_loans(pool.get_ref()).await {
        Ok(loans) => HttpResponse::Ok().json(loans),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

/// POST /api/admin/deposits/confirm
pub async fn confirm_deposit(
    pool: web::Data<DbPool>,
    settings: web::Data<Settings>,
    req: web::Json<ConfirmDepositRequest>,
) -> impl Responder {
    let ref_code = &req.reference_code;
    
    // Find the pending deposit in SQLite
    let pending_list = deposit_repo::list_pending_deposits(pool.get_ref()).await.unwrap_or_default();
    let found = pending_list.iter().find(|d| &d.reference_code == ref_code);

    let deposit_details = match found {
        Some(d) => d,
        None => return HttpResponse::BadRequest().body("Pending deposit reference code not found."),
    };

    let stellar_client = StellarClient::new(settings.get_ref());
    let amount_stroops = currency_converter::xlm_to_stroops(deposit_details.est_xlm);

    // Call Soroban contract to deposit the XLM tokens
    match stellar_client.deposit(&deposit_details.phone, amount_stroops).await {
        Ok(res) => {
            // Delete from pending deposits in DB
            let _ = deposit_repo::delete_pending_deposit(pool.get_ref(), ref_code).await;

            // Log successful transaction
            let tx = Transaction {
                id: None,
                user_phone: deposit_details.phone.clone(),
                tx_type: "Deposit".to_string(),
                amount_stroops: amount_stroops as i64,
                status: "Success".to_string(),
                reference_code: res.tx_hash,
                created_at: Local::now().to_rfc3339(),
            };
            let _ = deposit_repo::create_transaction(pool.get_ref(), &tx).await;

            HttpResponse::Ok().json(tx)
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Soroban deposit call failed: {}", e)),
    }
}

/// POST /api/admin/repay/manual
pub async fn manual_repay(
    pool: web::Data<DbPool>,
    settings: web::Data<Settings>,
    req: web::Json<ManualRepayRequest>,
) -> impl Responder {
    let formatted_phone = phone_formatter::format_phone(&req.phone);

    match deposit_repo::get_active_loan(pool.get_ref(), &formatted_phone).await {
        Ok(Some(active_loan)) => {
            let repay_xlm = currency_converter::kes_to_xlm(req.amount_kes);
            let repay_stroops = currency_converter::xlm_to_stroops(repay_xlm);
            
            let stellar_client = StellarClient::new(settings.get_ref());

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

                    HttpResponse::Ok().json(tx)
                }
                Err(e) => HttpResponse::InternalServerError().body(format!("Soroban repay call failed: {}", e)),
            }
        }
        Ok(None) => HttpResponse::BadRequest().body("User does not have an active loan."),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

/// POST /api/admin/users/invite
pub async fn invite_user(
    pool: web::Data<DbPool>,
    settings: web::Data<Settings>,
    req: web::Json<InviteUserRequest>,
) -> impl Responder {
    let formatted_phone = phone_formatter::format_phone(&req.phone);
    let name = &req.name;

    let stellar_client = StellarClient::new(settings.get_ref());

    match stellar_client.register(&formatted_phone, name).await {
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

            HttpResponse::Ok().json(new_user)
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Soroban registration failed: {}", e)),
    }
}

fn min(a: usize, b: usize) -> usize {
    if a < b { a } else { b }
}
