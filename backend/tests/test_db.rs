//! PesaText - Backend Tests
//! 
//! File: tests/test_db.rs
//! Description: Integration tests for database CRUD operations
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use pesatext_backend::db::connection::establish_connection;
use pesatext_backend::db::{user_repo, deposit_repo};
use pesatext_backend::models::user::User;
use pesatext_backend::models::loan::Loan;
use pesatext_backend::models::transaction::Transaction;

#[tokio::test]
async fn test_db_user_crud() {
    let pool = establish_connection("sqlite::memory:").await.unwrap();
    
    let new_user = User {
        id: None,
        phone: "+254712345678".to_string(),
        name: "Test User".to_string(),
        stellar_address: "GBTESTADDRESSXXXXXXXXXXXXXXXXXX".to_string(),
        created_at: "2026-06-03T12:00:00Z".to_string(),
    };

    // Create
    user_repo::create_user(&pool, &new_user).await.unwrap();

    // Get
    let fetched = user_repo::get_user(&pool, "+254712345678").await.unwrap().unwrap();
    assert_eq!(fetched.name, "Test User");
    assert_eq!(fetched.phone, "+254712345678");

    // List
    let users = user_repo::list_users(&pool).await.unwrap();
    assert_eq!(users.len(), 1);

    // Delete
    user_repo::delete_user(&pool, "+254712345678").await.unwrap();
    let fetched_after = user_repo::get_user(&pool, "+254712345678").await.unwrap();
    assert!(fetched_after.is_none());
}

#[tokio::test]
async fn test_db_transaction_crud() {
    let pool = establish_connection("sqlite::memory:").await.unwrap();
    
    let tx = Transaction {
        id: None,
        user_phone: "+254712345678".to_string(),
        tx_type: "Deposit".to_string(),
        amount_stroops: 100000000,
        status: "Success".to_string(),
        reference_code: "tx_mock_hash".to_string(),
        created_at: "2026-06-03T12:00:00Z".to_string(),
    };

    deposit_repo::create_transaction(&pool, &tx).await.unwrap();

    let txs = deposit_repo::list_transactions(&pool).await.unwrap();
    assert_eq!(txs.len(), 1);
    assert_eq!(txs[0].reference_code, "tx_mock_hash");
}

#[tokio::test]
async fn test_db_loan_crud() {
    let pool = establish_connection("sqlite::memory:").await.unwrap();
    
    let loan = Loan {
        id: None,
        user_phone: "+254712345678".to_string(),
        principal_stroops: 500000000,
        interest_stroops: 25000000,
        status: "Active".to_string(),
        issued_at: "2026-06-03T12:00:00Z".to_string(),
        due_at: "2026-07-03T12:00:00Z".to_string(),
    };

    deposit_repo::create_loan(&pool, &loan).await.unwrap();

    let active = deposit_repo::get_active_loan(&pool, "+254712345678").await.unwrap().unwrap();
    assert_eq!(active.principal_stroops, 500000000);
    assert_eq!(active.status, "Active");
}
