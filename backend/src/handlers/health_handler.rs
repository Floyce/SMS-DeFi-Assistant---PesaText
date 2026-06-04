//! PesaText - Health Handler
//! File: health_handler.rs
//! Description: Health check endpoint
//! Author: Floyce
//! Created: 2026-06-03

use actix_web::{HttpResponse, Responder};
use serde_json::json;

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "ok"
    }))
}