//! PesaText - Africa's Talking SMS Handler
//! File: sms_africastalking.rs
//! Description: Handles incoming SMS webhooks from Africa's Talking
//! Author: Floyce
//! Created: 2026-06-04

use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use log::info;

#[derive(Deserialize, Debug)]
pub struct AfricaTalkingWebhook {
    pub from: String,
    pub text: String,
    pub id: String,
    #[serde(rename = "linkId")]
    pub link_id: Option<String>,
}

pub async fn handle_sms(payload: web::Json<AfricaTalkingWebhook>) -> impl Responder {
    let phone = &payload.from;
    let message = &payload.text;
    
    info!("Received SMS from {}: {}", phone, message);
    
    // Simple response for now
    let response = match message.trim().to_uppercase().as_str() {
        "HELP" => "PesaText commands:\nREGISTER [Name] - Register account\nBALANCE - Check balance\nSAVE [KES] - Save XLM\nBORROW [KES] - Borrow (5% interest)\nREPAY [KES] - Repay loan\nHELP - Show commands".to_string(),
        _ => format!("Unknown command. Reply HELP for available commands."),
    };
    
    info!("Response: {}", response);
    
    HttpResponse::Ok().body(response)
}