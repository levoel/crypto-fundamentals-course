use anchor_lang::prelude::*;

#[error_code]
pub enum CourseError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Counter overflow")]
    Overflow,
}
