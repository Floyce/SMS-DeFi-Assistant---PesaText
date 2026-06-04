#![cfg(test)]

use super::{PesaTextContract, PesaTextContractClient};
use soroban_sdk::{testutils::Ledger, Env, String};

fn setup_env() -> Env {
    let env = Env::default();

    // FIX: deterministic ledger for loan timestamps
    env.ledger().set(soroban_sdk::testutils::LedgerInfo {
        timestamp: 1000,
        protocol_version: 1,
        sequence_number: 1,
        network_id: Default::default(),
        base_reserve: 10,
    });

    env
}

fn create_client(env: &Env) -> PesaTextContractClient {
    let contract_id = env.register_contract(None, PesaTextContract);
    PesaTextContractClient::new(env, &contract_id)
}

#[test]
fn test_registration() {
    let env = setup_env();
    let client = create_client(&env);

    let phone = String::from_str(&env, "+254712345678");
    let name = String::from_str(&env, "Jane Doe");

    client.register(&phone, &name).unwrap();

    let balance = client.get_balance(&phone).unwrap();
    assert_eq!(balance, 0);

    let username = client.get_username(&phone).unwrap();
    assert_eq!(username, name);
}

#[test]
fn test_deposit() {
    let env = setup_env();
    let client = create_client(&env);

    let phone = String::from_str(&env, "+254712345678");
    let name = String::from_str(&env, "Jane Doe");

    client.register(&phone, &name).unwrap();

    let new_balance = client.deposit(&phone, &1000).unwrap();
    assert_eq!(new_balance, 1000);

    let balance = client.get_balance(&phone).unwrap();
    assert_eq!(balance, 1000);
}

#[test]
fn test_borrow() {
    let env = setup_env();
    let client = create_client(&env);

    let phone = String::from_str(&env, "+254712345678");
    let name = String::from_str(&env, "Jane Doe");

    client.register(&phone, &name).unwrap();

    let total_due = client.borrow(&phone, &100).unwrap();
    assert_eq!(total_due, 105);

    let balance = client.get_balance(&phone).unwrap();
    assert_eq!(balance, 100);

    let loan = client.get_loan(&phone).unwrap().unwrap();
    assert_eq!(loan.principal, 100);
    assert_eq!(loan.interest, 5);
}

#[test]
fn test_repayment_full() {
    let env = setup_env();
    let client = create_client(&env);

    let phone = String::from_str(&env, "+254712345678");
    let name = String::from_str(&env, "Jane Doe");

    client.register(&phone, &name).unwrap();
    client.borrow(&phone, &100).unwrap();

    let remaining_due = client.repay(&phone, &110).unwrap();
    assert_eq!(remaining_due, 0);

    let loan = client.get_loan(&phone).unwrap();
    assert!(loan.is_none());

    let balance = client.get_balance(&phone).unwrap();
    assert_eq!(balance, 105);
}

#[test]
fn test_repayment_partial() {
    let env = setup_env();
    let client = create_client(&env);

    let phone = String::from_str(&env, "+254712345678");
    let name = String::from_str(&env, "Jane Doe");

    client.register(&phone, &name).unwrap();
    client.borrow(&phone, &100).unwrap();

    let remaining_due = client.repay(&phone, &50).unwrap();
    assert_eq!(remaining_due, 55);

    let loan = client.get_loan(&phone).unwrap().unwrap();
    assert_eq!(loan.principal, 55);
    assert_eq!(loan.interest, 0);
}
