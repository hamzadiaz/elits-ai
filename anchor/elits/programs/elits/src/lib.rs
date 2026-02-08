use anchor_lang::prelude::*;

declare_id!("5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF");

#[program]
pub mod elits {
    use super::*;

    pub fn create_elit(
        ctx: Context<CreateElit>,
        name: String,
        bio: String,
        personality_hash: String,
        avatar_uri: String,
    ) -> Result<()> {
        let elit = &mut ctx.accounts.elit;
        elit.owner = ctx.accounts.owner.key();
        elit.name = name;
        elit.bio = bio;
        elit.personality_hash = personality_hash;
        elit.avatar_uri = avatar_uri;
        elit.created_at = Clock::get()?.unix_timestamp;
        elit.status = ElitStatus::Active;
        elit.bump = ctx.bumps.elit;
        Ok(())
    }

    pub fn verify_elit(ctx: Context<VerifyElit>) -> Result<()> {
        let elit = &ctx.accounts.elit;
        require!(elit.status == ElitStatus::Active, ElitError::ElitRevoked);
        // Verification is just reading — if we get here, it's valid
        Ok(())
    }

    pub fn delegate(
        ctx: Context<Delegate>,
        scope: String,
        expires_at: i64,
        restrictions: String,
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.elit = ctx.accounts.elit.key();
        delegation.delegate = ctx.accounts.delegate_authority.key();
        delegation.scope = scope;
        delegation.expires_at = expires_at;
        delegation.restrictions = restrictions;
        delegation.created_at = Clock::get()?.unix_timestamp;
        delegation.active = true;
        delegation.bump = ctx.bumps.delegation;
        Ok(())
    }

    pub fn revoke_elit(ctx: Context<RevokeElit>) -> Result<()> {
        let elit = &mut ctx.accounts.elit;
        elit.status = ElitStatus::Revoked;
        Ok(())
    }

    pub fn revoke_delegation(ctx: Context<RevokeDelegation>) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.active = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateElit<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + ElitAccount::INIT_SPACE,
        seeds = [b"elit", owner.key().as_ref()],
        bump
    )]
    pub elit: Account<'info, ElitAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyElit<'info> {
    #[account(
        seeds = [b"elit", elit.owner.as_ref()],
        bump = elit.bump
    )]
    pub elit: Account<'info, ElitAccount>,
}

#[derive(Accounts)]
pub struct Delegate<'info> {
    #[account(
        seeds = [b"elit", owner.key().as_ref()],
        bump = elit.bump,
        has_one = owner
    )]
    pub elit: Account<'info, ElitAccount>,
    #[account(
        init,
        payer = owner,
        space = 8 + DelegationAccount::INIT_SPACE,
        seeds = [b"delegation", elit.key().as_ref(), delegate_authority.key().as_ref()],
        bump
    )]
    pub delegation: Account<'info, DelegationAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: The delegate authority receiving delegation
    pub delegate_authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeElit<'info> {
    #[account(
        mut,
        seeds = [b"elit", owner.key().as_ref()],
        bump = elit.bump,
        has_one = owner
    )]
    pub elit: Account<'info, ElitAccount>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RevokeDelegation<'info> {
    #[account(
        seeds = [b"elit", owner.key().as_ref()],
        bump = elit.bump,
        has_one = owner
    )]
    pub elit: Account<'info, ElitAccount>,
    #[account(
        mut,
        seeds = [b"delegation", elit.key().as_ref(), delegation.delegate.as_ref()],
        bump = delegation.bump
    )]
    pub delegation: Account<'info, DelegationAccount>,
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ElitAccount {
    pub owner: Pubkey,
    #[max_len(50)]
    pub name: String,
    #[max_len(280)]
    pub bio: String,
    #[max_len(64)]
    pub personality_hash: String,
    #[max_len(200)]
    pub avatar_uri: String,
    pub created_at: i64,
    pub status: ElitStatus,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct DelegationAccount {
    pub elit: Pubkey,
    pub delegate: Pubkey,
    #[max_len(100)]
    pub scope: String,
    pub expires_at: i64,
    #[max_len(200)]
    pub restrictions: String,
    pub created_at: i64,
    pub active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ElitStatus {
    Active,
    Revoked,
}

#[error_code]
pub enum ElitError {
    #[msg("This Elit has been revoked")]
    ElitRevoked,
}
