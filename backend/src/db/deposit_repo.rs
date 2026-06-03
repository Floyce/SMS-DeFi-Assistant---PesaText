use crate::db::DbPool;
use crate::models::loan::Loan;
use crate::models::transaction::Transaction;

// --- Pending Deposits ---
pub async fn create_pending_deposit(
    pool: &DbPool,
    ref_code: &str,
    phone: &str,
    amount_kes: f64,
    est_xlm: f64,
    created_at: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO pending_deposits (reference_code, phone, amount_kes, est_xlm, created_at)
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(ref_code)
    .bind(phone)
    .bind(amount_kes)
    .bind(est_xlm)
    .bind(created_at)
    .execute(pool)
    .await?;
    Ok(())
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct PendingDeposit {
    pub id: i64,
    pub reference_code: String,
    pub phone: String,
    pub amount_kes: f64,
    pub est_xlm: f64,
    pub created_at: String,
}

pub async fn list_pending_deposits(pool: &DbPool) -> Result<Vec<PendingDeposit>, sqlx::Error> {
    sqlx::query_as::<_, PendingDeposit>("SELECT id, reference_code, phone, amount_kes, est_xlm, created_at FROM pending_deposits")
        .fetch_all(pool)
        .await
}

pub async fn delete_pending_deposit(pool: &DbPool, ref_code: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM pending_deposits WHERE reference_code = ?")
        .bind(ref_code)
        .execute(pool)
        .await?;
    Ok(())
}

// --- Transactions ---
pub async fn create_transaction(pool: &DbPool, tx: &Transaction) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO transactions (user_phone, tx_type, amount_stroops, status, reference_code, created_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&tx.user_phone)
    .bind(&tx.tx_type)
    .bind(tx.amount_stroops)
    .bind(&tx.status)
    .bind(&tx.reference_code)
    .bind(&tx.created_at)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn list_transactions(pool: &DbPool) -> Result<Vec<Transaction>, sqlx::Error> {
    sqlx::query_as::<_, Transaction>(
        "SELECT id, user_phone, tx_type, amount_stroops, status, reference_code, created_at FROM transactions"
    )
    .fetch_all(pool)
    .await
}

// --- Loans ---
pub async fn create_loan(pool: &DbPool, loan: &Loan) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO loans (user_phone, principal_stroops, interest_stroops, status, issued_at, due_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&loan.user_phone)
    .bind(loan.principal_stroops)
    .bind(loan.interest_stroops)
    .bind(&loan.status)
    .bind(&loan.issued_at)
    .bind(&loan.due_at)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_active_loan(pool: &DbPool, phone: &str) -> Result<Option<Loan>, sqlx::Error> {
    sqlx::query_as::<_, Loan>(
        "SELECT id, user_phone, principal_stroops, interest_stroops, status, issued_at, due_at 
         FROM loans WHERE user_phone = ? AND status = 'Active'"
    )
    .bind(phone)
    .fetch_optional(pool)
    .await
}

pub async fn update_loan_status(pool: &DbPool, id: i64, status: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE loans SET status = ? WHERE id = ?")
        .bind(status)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn list_loans(pool: &DbPool) -> Result<Vec<Loan>, sqlx::Error> {
    sqlx::query_as::<_, Loan>(
        "SELECT id, user_phone, principal_stroops, interest_stroops, status, issued_at, due_at FROM loans"
    )
    .fetch_all(pool)
    .await
}
