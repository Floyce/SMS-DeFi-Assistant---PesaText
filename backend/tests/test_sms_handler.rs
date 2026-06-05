//! PesaText - Backend Tests
//!
//! File: tests/test_sms_handler.rs
//! Description: Integration tests for Africa's Talking SMS webhook handling
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-05

use actix_web::{http::StatusCode, test, web, Responder};
use pesatext_backend::config::Settings;
use pesatext_backend::db::connection::establish_connection;
use pesatext_backend::handlers::sms_handler::{handle_sms, AfricaTalkingWebhook};

#[tokio::test]
async fn test_sms_help_command() {
    let settings = Settings::new();
    let pool = establish_connection("sqlite::memory:").await.unwrap();

    let payload = web::Json(AfricaTalkingWebhook {
        from: "+254712345678".to_string(),
        text: "HELP".to_string(),
        id: "msg12345678".to_string(),
        link_id: None,
    });

    let response = handle_sms(web::Data::new(pool), web::Data::new(settings), payload).await;

    let req = test::TestRequest::default().to_http_request();
    let resp = response.respond_to(&req);

    assert_eq!(resp.status(), StatusCode::OK);

    let body_bytes = test::read_body(resp).await;
    let body_str = std::str::from_utf8(&body_bytes).unwrap();

    assert!(body_str.contains("\"status\":\"success\""));
    assert!(body_str.contains("PesaText commands:"));
}

#[tokio::test]
async fn test_sms_balance_unregistered() {
    let settings = Settings::new();
    let pool = establish_connection("sqlite::memory:").await.unwrap();

    let payload = web::Json(AfricaTalkingWebhook {
        from: "+254712345678".to_string(),
        text: "BALANCE".to_string(),
        id: "msg12345678".to_string(),
        link_id: None,
    });

    let response = handle_sms(web::Data::new(pool), web::Data::new(settings), payload).await;

    let req = test::TestRequest::default().to_http_request();
    let resp = response.respond_to(&req);

    let body_bytes = test::read_body(resp).await;
    let body_str = std::str::from_utf8(&body_bytes).unwrap();

    assert!(body_str.contains("You are not registered"));
}
