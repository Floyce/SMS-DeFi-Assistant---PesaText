#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

mod errors;
mod storage;

#[cfg(test)]
mod test;

use crate::errors::ContractError;
use crate::storage::LoanDetails;

#[contract]
pub struct PesaTextContract;

#[contractimpl]
impl PesaTextContract {
    /// Registers a new user. Returns Ok(()) or Error.
    pub fn register(env: Env, phone: String, name: String) -> Result<(), ContractError> {
        if storage::has_user(&env, &phone) {
            return Err(ContractError::UserAlreadyExists);
        }
        storage::set_user(&env, &phone, &name);
        storage::set_balance(&env, &phone, 0);
        Ok(())
    }

    /// Deposits XLM (represented as i128 stroops) to a user's savings balance.
    pub fn deposit(env: Env, phone: String, amount: i128) -> Result<i128, ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if !storage::has_user(&env, &phone) {
            return Err(ContractError::UserNotFound);
        }
        let current_bal = storage::get_balance(&env, &phone);
        let new_bal = current_bal + amount;
        storage::set_balance(&env, &phone, new_bal);
        Ok(new_bal)
    }

    /// Borrows XLM. Emits a loan with 5% interest. Term is handled off-chain or via timestamps.
    pub fn borrow(env: Env, phone: String, amount: i128) -> Result<i128, ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if !storage::has_user(&env, &phone) {
            return Err(ContractError::UserNotFound);
        }
        if storage::get_loan(&env, &phone).is_some() {
            return Err(ContractError::ActiveLoanExists);
        }

        // Calculate 5% interest (using integer math, i.e. amount * 5 / 100)
        let interest = amount * 5 / 100;
        let loan_details = LoanDetails {
            principal: amount,
            interest,
            timestamp: env.ledger().timestamp(),
        };

        storage::set_loan(&env, &phone, &loan_details);

        // Credit the borrowed principal to user's balance
        let current_bal = storage::get_balance(&env, &phone);
        let new_bal = current_bal + amount;
        storage::set_balance(&env, &phone, new_bal);

        Ok(amount + interest)
    }

    /// Repays a loan. If amount is greater than outstanding loan, excess is added to balance.
    pub fn repay(env: Env, phone: String, amount: i128) -> Result<i128, ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        if !storage::has_user(&env, &phone) {
            return Err(ContractError::UserNotFound);
        }

        let loan = match storage::get_loan(&env, &phone) {
            Some(l) => l,
            None => return Err(ContractError::NoActiveLoan),
        };

        let total_due = loan.principal + loan.interest;
        let mut user_balance = storage::get_balance(&env, &phone);

        if amount >= total_due {
            // Loan fully paid
            storage::remove_loan(&env, &phone);
            let excess = amount - total_due;
            if excess > 0 {
                user_balance += excess;
                storage::set_balance(&env, &phone, user_balance);
            }
            Ok(0) // Remaining due is 0
        } else {
            // Partial repayment
            let mut remaining_repay = amount;
            let mut new_interest = loan.interest;
            let mut new_principal = loan.principal;

            // Repay interest first
            if remaining_repay >= new_interest {
                remaining_repay -= new_interest;
                new_interest = 0;
            } else {
                new_interest -= remaining_repay;
                remaining_repay = 0;
            }

            // Repay principal next
            new_principal -= remaining_repay;

            let updated_loan = LoanDetails {
                principal: new_principal,
                interest: new_interest,
                timestamp: loan.timestamp,
            };

            storage::set_loan(&env, &phone, &updated_loan);
            Ok(new_principal + new_interest)
        }
    }

    /// Returns user savings balance.
    pub fn get_balance(env: Env, phone: String) -> Result<i128, ContractError> {
        if !storage::has_user(&env, &phone) {
            return Err(ContractError::UserNotFound);
        }
        Ok(storage::get_balance(&env, &phone))
    }

    /// Returns active loan details (outstanding due: principal + interest).
    pub fn get_loan(env: Env, phone: String) -> Result<Option<LoanDetails>, ContractError> {
        if !storage::has_user(&env, &phone) {
            return Err(ContractError::UserNotFound);
        }
        Ok(storage::get_loan(&env, &phone))
    }

    /// Returns user name.
    pub fn get_username(env: Env, phone: String) -> Result<String, ContractError> {
        match storage::get_user_name(&env, &phone) {
            Some(name) => Ok(name),
            None => Err(ContractError::UserNotFound),
        }
    }
}
