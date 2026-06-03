//! PesaText - Loan Service
//! File: loan_service.rs
//! Description: Service for loan calculations and checks
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

use chrono::{Duration, Local};

pub struct LoanCalculation {
    pub principal_stroops: i64,
    pub interest_stroops: i64,
    pub total_due_stroops: i64,
    pub issued_at: String,
    pub due_at: String,
}

pub fn calculate_loan(amount_stroops: i64) -> LoanCalculation {
    // 5% interest
    let interest = amount_stroops * 5 / 100;
    let total_due = amount_stroops + interest;

    let now = Local::now();
    let due_date = now + Duration::days(30);

    LoanCalculation {
        principal_stroops: amount_stroops,
        interest_stroops: interest,
        total_due_stroops: total_due,
        issued_at: now.to_rfc3339(),
        due_at: due_date.to_rfc3339(),
    }
}

pub fn is_loan_overdue(due_at_rfc3339: &str) -> bool {
    if let Ok(due_date) = chrono::DateTime::parse_from_rfc3339(due_at_rfc3339) {
        let now = Local::now();
        now.naive_local() > due_date.naive_local()
    } else {
        false
    }
}
