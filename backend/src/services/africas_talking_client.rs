//! Africa's Talking SMS Client
//! File: africas_talking_client.rs
//! Description: Handles SMS sending via Africa's Talking API

use crate::config::Settings;
use log::{error, info};
use reqwest::Client;

pub struct AfricasTalkingClient {
    api_key: String,
    username: String,
    http_client: Client,
}

impl AfricasTalkingClient {
    pub fn new(settings: &Settings) -> Self {
        Self {
            api_key: settings.africas_talking_api_key.clone(),
            username: settings.africas_talking_username.clone(),
            http_client: Client::new(),
        }
    }

    pub async fn send_sms(&self, to_phone: &str, message: &str) -> Result<String, String> {
        let url = "https://api.sandbox.africastalking.com/version1/messaging";

        // Africa's Talking expects form-urlencoded data
        let params = [
            ("username", self.username.as_str()),
            ("to", to_phone),
            ("message", message),
        ];

        info!("Sending SMS to {}", to_phone);

        let response = self
            .http_client
            .post(url)
            .header("apiKey", &self.api_key)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .form(&params)
            .send()
            .await
            .map_err(|e| {
                error!("Failed to send SMS: {}", e);
                format!("HTTP error: {}", e)
            })?;

        let status = response.status();

        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read response body".to_string());

        info!("Africa's Talking response: {}", body);

        if status.is_success() {
            Ok(body)
        } else {
            error!("Africa's Talking API error: {}", body);
            Err(format!("Africa's Talking API error: {}", body))
        }
    }
}
