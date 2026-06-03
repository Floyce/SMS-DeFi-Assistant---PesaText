//! PesaText - Backend API
//! File: main.rs
//! Description: Entry point for Actix web server
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03
use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use log::info;

use pesatext_backend::config::Settings;
use pesatext_backend::db::connection::establish_connection;
use pesatext_backend::handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    std::env::set_var("RUST_LOG", "info");
    env_logger::init();

    let settings = Settings::new();
    info!("PesaText Server booting up...");
    info!("Database URL: {}", settings.database_url);
    info!("Soroban Contract ID: {}", settings.soroban_contract_id);

    // Initialize Database
    let pool = establish_connection(&settings.database_url)
        .await
        .expect("Failed to initialize database and run schema migrations");

    let server_settings = settings.clone();
    let port = server_settings.server_port;

    info!("Starting HTTP server on port {}...", port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(server_settings.clone()))
            
            // Public Webhook Routes
            .route("/api/health", web::get().to(handlers::health_handler::health_check))
            .route("/api/sms", web::post().to(handlers::sms_handler::handle_sms))
            
            // Admin Dashboard APIs
            .service(
                web::scope("/api/admin")
                    .route("/stats", web::get().to(handlers::admin_handler::get_stats))
                    .route("/users", web::get().to(handlers::admin_handler::get_users))
                    .route("/transactions", web::get().to(handlers::admin_handler::get_transactions))
                    .route("/deposits/pending", web::get().to(handlers::admin_handler::get_pending_deposits))
                    .route("/loans", web::get().to(handlers::admin_handler::get_loans))
                    .route("/deposits/confirm", web::post().to(handlers::admin_handler::confirm_deposit))
                    .route("/repay/manual", web::post().to(handlers::admin_handler::manual_repay))
                    .route("/users/invite", web::post().to(handlers::admin_handler::invite_user))
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
