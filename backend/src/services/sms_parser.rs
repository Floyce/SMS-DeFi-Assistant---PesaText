//! PesaText - SMS Parser
//! File: sms_parser.rs
//! Description: Parse SMS text messages into commands
//! Author: Floyce
//! Created: 2026-06-03
//! Last Modified: 2026-06-03

#[derive(Debug, PartialEq)]
pub enum SmsCommand {
    Register(String),
    Balance,
    Save(f64),
    Borrow(f64),
    Repay(f64),
    Help,
    Unknown(String),
}

pub fn parse_message(body: &str) -> SmsCommand {
    let trimmed = body.trim();
    let parts: Vec<&str> = trimmed.split_whitespace().collect();

    if parts.is_empty() {
        return SmsCommand::Unknown("Empty message".to_string());
    }

    let keyword = parts[0].to_uppercase();

    match keyword.as_str() {
        "REGISTER" => {
            if parts.len() < 2 {
                return SmsCommand::Unknown("Missing name for registration. Use: REGISTER [Name]".to_string());
            }
            let name = parts[1..].join(" ");
            SmsCommand::Register(name)
        }
        "BALANCE" => SmsCommand::Balance,
        "SAVE" => {
            if parts.len() < 2 {
                return SmsCommand::Unknown("Missing amount to save. Use: SAVE [Amount]".to_string());
            }
            match parts[1].parse::<f64>() {
                Ok(amount) => SmsCommand::Save(amount),
                Err(_) => SmsCommand::Unknown("Invalid amount format. Use: SAVE [Number]".to_string()),
            }
        }
        "BORROW" => {
            if parts.len() < 2 {
                return SmsCommand::Unknown("Missing borrowing amount. Use: BORROW [Amount]".to_string());
            }
            match parts[1].parse::<f64>() {
                Ok(amount) => SmsCommand::Borrow(amount),
                Err(_) => SmsCommand::Unknown("Invalid amount format. Use: BORROW [Number]".to_string()),
            }
        }
        "REPAY" => {
            if parts.len() < 2 {
                return SmsCommand::Unknown("Missing repayment amount. Use: REPAY [Amount]".to_string());
            }
            match parts[1].parse::<f64>() {
                Ok(amount) => SmsCommand::Repay(amount),
                Err(_) => SmsCommand::Unknown("Invalid amount format. Use: REPAY [Number]".to_string()),
            }
        }
        "HELP" => SmsCommand::Help,
        _ => SmsCommand::Unknown(format!("Unknown command: {}. Send HELP for options.", keyword)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_message() {
        assert_eq!(parse_message("register John Doe"), SmsCommand::Register("John Doe".to_string()));
        assert_eq!(parse_message("   balance   "), SmsCommand::Balance);
        assert_eq!(parse_message("save 500"), SmsCommand::Save(500.0));
        assert_eq!(parse_message("borrow 1000.50"), SmsCommand::Borrow(1000.50));
        assert_eq!(parse_message("repay 200"), SmsCommand::Repay(200.0));
        assert_eq!(parse_message("help"), SmsCommand::Help);
        assert!(matches!(parse_message("invalid command"), SmsCommand::Unknown(_)));
    }
}
