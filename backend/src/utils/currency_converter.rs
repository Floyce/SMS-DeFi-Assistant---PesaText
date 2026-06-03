/// Convert KES (Kenyan Shilling) to XLM.
/// Mock Rate: 1 XLM = 15 KES
pub fn kes_to_xlm(kes: f64) -> f64 {
    kes / 15.0
}

/// Convert XLM to KES.
pub fn xlm_to_kes(xlm: f64) -> f64 {
    xlm * 15.0
}

/// Convert XLM value to Stroops (1 XLM = 10_000_000 Stroops)
pub fn xlm_to_stroops(xlm: f64) -> i128 {
    (xlm * 10_000_000.0) as i128
}

/// Convert Stroops to XLM value
pub fn stroops_to_xlm(stroops: i128) -> f64 {
    (stroops as f64) / 10_000_000.0
}
