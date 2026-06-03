use soroban_sdk::{contracttype, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Balance(String), // Phone number -> balance
    User(String),    // Phone number -> Name
    Loan(String),    // Phone number -> LoanDetails
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanDetails {
    pub principal: i128,
    pub interest: i128,
    pub timestamp: u64,
}

pub fn has_user(env: &Env, phone: &String) -> bool {
    env.storage().persistent().has(&DataKey::User(phone.clone()))
}

pub fn get_user_name(env: &Env, phone: &String) -> Option<String> {
    env.storage().persistent().get(&DataKey::User(phone.clone()))
}

pub fn set_user(env: &Env, phone: &String, name: &String) {
    env.storage().persistent().set(&DataKey::User(phone.clone()), name);
}

pub fn get_balance(env: &Env, phone: &String) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Balance(phone.clone()))
        .unwrap_or(0)
}

pub fn set_balance(env: &Env, phone: &String, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Balance(phone.clone()), &amount);
}

pub fn get_loan(env: &Env, phone: &String) -> Option<LoanDetails> {
    env.storage().persistent().get(&DataKey::Loan(phone.clone()))
}

pub fn set_loan(env: &Env, phone: &String, loan: &LoanDetails) {
    env.storage().persistent().set(&DataKey::Loan(phone.clone()), loan);
}

pub fn remove_loan(env: &Env, phone: &String) {
    env.storage().persistent().remove(&DataKey::Loan(phone.clone()));
}
