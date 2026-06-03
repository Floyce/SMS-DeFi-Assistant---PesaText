use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    UserAlreadyExists = 1,
    UserNotFound = 2,
    InsufficientBalance = 3,
    ActiveLoanExists = 4,
    NoActiveLoan = 5,
    InvalidAmount = 6,
    RepayAmountExceedsLoan = 7,
}
