#![no_std]

use soroban_sdk::{contract, contractimpl, Env, String};

mod errors;
mod storage;

#[contract]
pub struct PesaTextContract;

#[contractimpl]
impl PesaTextContract {
    pub fn register(
        env: Env,
        phone: String,
        name: String,
    ) -> core::result::Result<(), errors::ContractError> {
        if storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserAlreadyExists);
        }

        storage::set_user(&env, &phone, &name);
        storage::set_balance(&env, &phone, 0);

        Ok(())
    }

    pub fn deposit(
        env: Env,
        phone: String,
        amount: i128,
    ) -> core::result::Result<i128, errors::ContractError> {
        if amount <= 0 {
            return Err(errors::ContractError::InvalidAmount);
        }

        if !storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserNotFound);
        }

        let current = storage::get_balance(&env, &phone);

        let new_balance = current
            .checked_add(amount)
            .ok_or(errors::ContractError::InvalidAmount)?;

        storage::set_balance(&env, &phone, new_balance);

        Ok(new_balance)
    }

    pub fn borrow(
        env: Env,
        phone: String,
        amount: i128,
    ) -> core::result::Result<i128, errors::ContractError> {
        if amount <= 0 {
            return Err(errors::ContractError::InvalidAmount);
        }

        if !storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserNotFound);
        }

        if storage::get_loan(&env, &phone).is_some() {
            return Err(errors::ContractError::ActiveLoanExists);
        }

        let interest = amount * 5 / 100;

        let loan = storage::LoanDetails {
            principal: amount,
            interest,
            timestamp: env.ledger().timestamp(),
        };

        storage::set_loan(&env, &phone, &loan);

        let balance = storage::get_balance(&env, &phone);

        let new_balance = balance
            .checked_add(amount)
            .ok_or(errors::ContractError::InvalidAmount)?;

        storage::set_balance(&env, &phone, new_balance);

        Ok(amount + interest)
    }

    pub fn repay(
        env: Env,
        phone: String,
        amount: i128,
    ) -> core::result::Result<i128, errors::ContractError> {
        if amount <= 0 {
            return Err(errors::ContractError::InvalidAmount);
        }

        if !storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserNotFound);
        }

        let mut loan =
            storage::get_loan(&env, &phone).ok_or(errors::ContractError::NoActiveLoan)?;

        let total_due = loan.principal + loan.interest;

        if amount >= total_due {
            storage::remove_loan(&env, &phone);

            let excess = amount - total_due;

            if excess > 0 {
                let balance = storage::get_balance(&env, &phone);

                let new_balance = balance + excess;

                storage::set_balance(&env, &phone, new_balance);
            }

            return Ok(0);
        }

        let mut remaining = amount;

        // repay interest first
        if remaining >= loan.interest {
            remaining -= loan.interest;
            loan.interest = 0;
        } else {
            loan.interest -= remaining;
            remaining = 0;
        }

        // repay principal
        if remaining > 0 {
            loan.principal -= remaining;
        }

        storage::set_loan(&env, &phone, &loan);

        Ok(loan.principal + loan.interest)
    }

    pub fn get_balance(
        env: Env,
        phone: String,
    ) -> core::result::Result<i128, errors::ContractError> {
        if !storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserNotFound);
        }

        Ok(storage::get_balance(&env, &phone))
    }

    pub fn get_loan(
        env: Env,
        phone: String,
    ) -> core::result::Result<Option<storage::LoanDetails>, errors::ContractError> {
        if !storage::has_user(&env, &phone) {
            return Err(errors::ContractError::UserNotFound);
        }

        Ok(storage::get_loan(&env, &phone))
    }

    pub fn get_username(
        env: Env,
        phone: String,
    ) -> core::result::Result<String, errors::ContractError> {
        storage::get_user_name(&env, &phone).ok_or(errors::ContractError::UserNotFound)
    }
}
