use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, MintTo, Burn};

declare_id!("ByaYNFzb2fPCkWLJCMEY4tdrfNqEAKAPJB3kDX86W5Rq");

/// Dark Alpha Confidential (DAC) Token Program
///
/// This program provides a wrapped token (DAC) that can be used as collateral
/// in PNP prediction markets. Users deposit USDC to mint DAC tokens at 1:1 ratio.
///
/// Key features:
/// - Standard SPL Token compatible (works with PNP markets)
/// - 1:1 backing with USDC in program vault
/// - Mint authority controlled by program PDA
/// - Simple wrap/unwrap mechanism

/// Seeds for the mint authority PDA
pub const MINT_AUTHORITY_SEED: &[u8] = b"mint_authority";
/// Seeds for the vault authority PDA  
pub const VAULT_AUTHORITY_SEED: &[u8] = b"vault_authority";
/// Seeds for the config account
pub const CONFIG_SEED: &[u8] = b"config";

#[program]
pub mod dac_token {
    use super::*;

    /// Initialize the DAC token configuration
    /// This sets up the relationship between the DAC mint and backing USDC
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.dac_mint = ctx.accounts.dac_mint.key();
        config.usdc_mint = ctx.accounts.usdc_mint.key();
        config.vault = ctx.accounts.usdc_vault.key();
        config.total_wrapped = 0;
        config.mint_authority_bump = ctx.bumps.mint_authority;
        config.vault_authority_bump = ctx.bumps.vault_authority;
        config.is_initialized = true;

        msg!("DAC Token Config initialized");
        msg!("DAC Mint: {}", config.dac_mint);
        msg!("USDC Mint: {}", config.usdc_mint);
        msg!("Vault: {}", config.vault);
        Ok(())
    }

    /// Wrap USDC to DAC tokens
    /// User deposits USDC into vault, receives equivalent DAC tokens
    pub fn wrap(ctx: Context<Wrap>, amount: u64) -> Result<()> {
        require!(amount > 0, DacError::ZeroAmount);

        // Transfer USDC from user to vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_usdc.to_account_info(),
                to: ctx.accounts.usdc_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Mint DAC tokens to user
        let config_key = ctx.accounts.config.key();
        let seeds = &[
            MINT_AUTHORITY_SEED,
            config_key.as_ref(),
            &[ctx.accounts.config.mint_authority_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.dac_mint.to_account_info(),
                to: ctx.accounts.user_dac.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        token::mint_to(mint_ctx, amount)?;

        // Update total wrapped
        let config = &mut ctx.accounts.config;
        config.total_wrapped = config.total_wrapped.checked_add(amount)
            .ok_or(DacError::Overflow)?;

        msg!("Wrapped {} USDC to DAC", amount);
        Ok(())
    }

    /// Unwrap DAC tokens back to USDC
    /// User burns DAC tokens, receives equivalent USDC from vault
    pub fn unwrap(ctx: Context<Unwrap>, amount: u64) -> Result<()> {
        require!(amount > 0, DacError::ZeroAmount);

        // Burn DAC tokens from user
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.dac_mint.to_account_info(),
                from: ctx.accounts.user_dac.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, amount)?;

        // Transfer USDC from vault to user
        let config_key = ctx.accounts.config.key();
        let seeds = &[
            VAULT_AUTHORITY_SEED,
            config_key.as_ref(),
            &[ctx.accounts.config.vault_authority_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.usdc_vault.to_account_info(),
                to: ctx.accounts.user_usdc.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update total wrapped
        let config = &mut ctx.accounts.config;
        config.total_wrapped = config.total_wrapped.checked_sub(amount)
            .ok_or(DacError::Underflow)?;

        msg!("Unwrapped {} DAC to USDC", amount);
        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

/// Configuration account for the DAC token wrapper
#[account]
pub struct DacConfig {
    /// Authority that can update config
    pub authority: Pubkey,
    /// The DAC SPL token mint (standard SPL token)
    pub dac_mint: Pubkey,
    /// The underlying USDC mint
    pub usdc_mint: Pubkey,
    /// The USDC vault holding backing funds
    pub vault: Pubkey,
    /// Total amount of USDC wrapped (for tracking)
    pub total_wrapped: u64,
    /// Bump for mint authority PDA
    pub mint_authority_bump: u8,
    /// Bump for vault authority PDA
    pub vault_authority_bump: u8,
    /// Is initialized flag
    pub is_initialized: bool,
}

impl DacConfig {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 8 + 1 + 1 + 1; // 139 bytes
}

// ============================================================================
// Instruction Contexts
// ============================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The config account to initialize
    #[account(
        init,
        payer = authority,
        space = 8 + DacConfig::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, DacConfig>,

    /// The DAC SPL token mint (must already exist with mint authority set to our PDA)
    #[account(
        constraint = dac_mint.mint_authority.unwrap() == mint_authority.key() @ DacError::InvalidMintAuthority
    )]
    pub dac_mint: Account<'info, Mint>,

    /// The underlying USDC mint
    pub usdc_mint: Account<'info, Mint>,

    /// The USDC vault for holding deposited funds
    #[account(
        init,
        payer = authority,
        seeds = [b"usdc_vault", config.key().as_ref()],
        bump,
        token::mint = usdc_mint,
        token::authority = vault_authority,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// CHECK: Mint authority PDA - must match the DAC mint's authority
    #[account(
        seeds = [MINT_AUTHORITY_SEED, config.key().as_ref()],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,

    /// CHECK: Vault authority PDA
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, config.key().as_ref()],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Wrap<'info> {
    /// The config account
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
        constraint = config.is_initialized @ DacError::NotInitialized,
        constraint = config.dac_mint == dac_mint.key() @ DacError::MintMismatch,
    )]
    pub config: Account<'info, DacConfig>,

    /// The DAC SPL token mint
    #[account(mut)]
    pub dac_mint: Account<'info, Mint>,

    /// User's USDC token account (source)
    #[account(
        mut,
        constraint = user_usdc.mint == config.usdc_mint @ DacError::MintMismatch,
    )]
    pub user_usdc: Account<'info, TokenAccount>,

    /// User's DAC token account (destination)
    #[account(
        mut,
        constraint = user_dac.mint == config.dac_mint @ DacError::MintMismatch,
    )]
    pub user_dac: Account<'info, TokenAccount>,

    /// The USDC vault
    #[account(
        mut,
        seeds = [b"usdc_vault", config.key().as_ref()],
        bump,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// CHECK: Mint authority PDA
    #[account(
        seeds = [MINT_AUTHORITY_SEED, config.key().as_ref()],
        bump = config.mint_authority_bump,
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unwrap<'info> {
    /// The config account
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
        constraint = config.is_initialized @ DacError::NotInitialized,
        constraint = config.dac_mint == dac_mint.key() @ DacError::MintMismatch,
    )]
    pub config: Account<'info, DacConfig>,

    /// The DAC SPL token mint
    #[account(mut)]
    pub dac_mint: Account<'info, Mint>,

    /// User's DAC token account (source - will be burned)
    #[account(
        mut,
        constraint = user_dac.mint == config.dac_mint @ DacError::MintMismatch,
    )]
    pub user_dac: Account<'info, TokenAccount>,

    /// User's USDC token account (destination)
    #[account(
        mut,
        constraint = user_usdc.mint == config.usdc_mint @ DacError::MintMismatch,
    )]
    pub user_usdc: Account<'info, TokenAccount>,

    /// The USDC vault
    #[account(
        mut,
        seeds = [b"usdc_vault", config.key().as_ref()],
        bump,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// CHECK: Vault authority PDA
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, config.key().as_ref()],
        bump = config.vault_authority_bump,
    )]
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum DacError {
    #[msg("Config is not initialized")]
    NotInitialized,
    #[msg("Invalid mint authority - must be program PDA")]
    InvalidMintAuthority,
    #[msg("Mint mismatch")]
    MintMismatch,
    #[msg("Cannot process zero amount")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Arithmetic underflow")]
    Underflow,
}
