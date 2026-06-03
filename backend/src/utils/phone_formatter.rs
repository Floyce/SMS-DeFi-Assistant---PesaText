pub fn format_phone(phone: &str) -> String {
    let cleaned: String = phone.chars().filter(|c| c.is_ascii_digit()).collect();
    if cleaned.starts_with("0") && cleaned.len() == 10 {
        format!("+254{}", &cleaned[1..])
    } else if cleaned.starts_with("254") && cleaned.len() == 12 {
        format!("+{}", cleaned)
    } else if cleaned.len() == 9 {
        format!("+254{}", cleaned)
    } else if phone.starts_with('+') {
        phone.to_string()
    } else {
        format!("+{}", cleaned)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_phone() {
        assert_eq!(format_phone("0712345678"), "+254712345678");
        assert_eq!(format_phone("254712345678"), "+254712345678");
        assert_eq!(format_phone("+254712345678"), "+254712345678");
        assert_eq!(format_phone("712345678"), "+254712345678");
    }
}
