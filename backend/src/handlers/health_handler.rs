//! PesaText - Health Handler
//! File: health_handler.rs
//! Description: Health check endpoint
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use actix_web::{web, HttpResponse, Responder};
use crate::db::DbPool;
use serde_json::json;

pub async fn health_check(pool: web::Data<DbPool>) -> impl Responder {
    match sqlx::query("SELECT 1").execute(pool.get_ref()).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "healthy",
            "database": "connected",
            "version": "0.1.0"
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "unhealthy",
            "database": format!("error: {}", e)
        })),
    }
}
