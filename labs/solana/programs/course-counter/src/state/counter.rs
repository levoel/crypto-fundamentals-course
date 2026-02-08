use anchor_lang::prelude::*;

#[account]
pub struct Counter {
    /// The authority who can increment this counter
    pub authority: Pubkey,
    /// The current count value
    pub count: u64,
    /// The PDA bump seed (stored to avoid re-derivation)
    pub bump: u8,
}

impl Counter {
    /// Account space: 8 (discriminator) + 32 (Pubkey) + 8 (u64) + 1 (u8) = 49
    pub const SPACE: usize = 8 + 32 + 8 + 1;
}
