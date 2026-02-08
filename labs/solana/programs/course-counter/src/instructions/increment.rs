use anchor_lang::prelude::*;
use crate::constants::COUNTER_SEED;
use crate::error::CourseError;
use crate::state::Counter;

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [COUNTER_SEED, authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority @ CourseError::Unauthorized,
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<Increment>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = counter.count.checked_add(1).ok_or(CourseError::Overflow)?;
    msg!("Counter incremented to {}", counter.count);
    Ok(())
}
