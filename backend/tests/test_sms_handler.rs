//! PesaText - Backend Tests
//! 
//! File: tests/test_sms_handler.rs
//! Description: Integration tests for Twilio SMS webhook handling
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use actix_web::{web, Responder};
use pesatext_backend::config::Settings;
use pesatext_backend::db::connection::establish_connection;
use pesatext_backend::handlers::sms_handler::{handle_sms, TwilioSmsRequest};

#[tokio::test]
async fn test_sms_help_command() {
    let settings = Settings::new();
    let pool = establish_connection("sqlite::memory:").await.unwrap();
    
    let form = web::Form(TwilioSmsRequest {
        message_sid: Some("SM12345678".to_string()),
        from: "+254712345678".to_string(),
        body: "HELP".to_string(),
    });

    let response = handle_sms(
        web::Data::new(pool),
        web::Data::new(settings),
        form,
    ).await;

    let req = actix_web::test::TestRequest::default().to_http_request();
    let resp = response.respond_to(&req);
    
    assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
    
    let body_bytes = actix_web::body::to_bytes(resp.into_body()).await.unwrap();
    let body_str = std::str::from_utf8(&body_bytes).unwrap();
    
    assert!(body_str.contains("<Response>"));
    assert!(body_str.contains("PesaText commands:"));
}

#[tokio::test]
async fn test_sms_balance_unregistered() {
    let settings = Settings::new();
    let pool = establish_connection("sqlite::memory:").await.unwrap();
    
    let form = web::Form(TwilioSmsRequest {
        message_sid: Some("SM12345678".to_string()),
        from: "+254712345678".to_string(),
        body: "BALANCE".to_string(),
    });

    let response = handle_sms(
        web::Data::new(pool),
        web::Data::new(settings),
        form,
    ).await;

    let req = actix_web::test::TestRequest::default().to_http_request();
    let resp = response.respond_to(&req);
    
    let body_bytes = actix_web::body::to_bytes(resp.into_body()).await.unwrap();
    let body_str = std::str::from_utf8(&body_bytes).unwrap();
    
    assert!(body_str.contains("You are not registered"));
}
