use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use std::mem::size_of;

declare_id!("NaviSafe11111111111111111111111111111111111");

#[program]
pub mod navisafe_tourist_registry {
    use super::*;

    /// Initialize a new tourist registration on the blockchain
    pub fn register_tourist(
        ctx: Context<RegisterTourist>,
        digital_id: String,
        name: String,
        gender: String,
        age: u8,
        id_number_hash: String, // Hashed for privacy
        phone: String,
        nationality: String,
        email: Option<String>,
        registration_timestamp: i64,
    ) -> Result<()> {
        let tourist_account = &mut ctx.accounts.tourist_account;
        let clock = Clock::get()?;

        // Validate input data
        require!(name.len() <= 100, ErrorCode::NameTooLong);
        require!(nationality.len() <= 50, ErrorCode::NationalityTooLong);
        require!(phone.len() <= 20, ErrorCode::PhoneTooLong);
        require!(age > 0 && age <= 120, ErrorCode::InvalidAge);
        require!(digital_id.len() <= 50, ErrorCode::DigitalIdTooLong);

        if let Some(ref email_val) = email {
            require!(email_val.len() <= 100, ErrorCode::EmailTooLong);
        }

        // Set tourist account data
        tourist_account.authority = ctx.accounts.user.key();
        tourist_account.digital_id = digital_id;
        tourist_account.name = name;
        tourist_account.gender = gender;
        tourist_account.age = age;
        tourist_account.id_number_hash = id_number_hash;
        tourist_account.phone = phone;
        tourist_account.nationality = nationality;
        tourist_account.email = email;
        tourist_account.registration_timestamp = registration_timestamp;
        tourist_account.blockchain_timestamp = clock.unix_timestamp;
        tourist_account.slot = clock.slot;
        tourist_account.is_active = true;
        tourist_account.version = 1;

        msg!("Tourist registered successfully with digital ID: {}", tourist_account.digital_id);
        msg!("Registration timestamp: {}", tourist_account.registration_timestamp);
        msg!("Blockchain timestamp: {}", tourist_account.blockchain_timestamp);

        Ok(())
    }

    /// Update tourist trip details
    pub fn update_trip_details(
        ctx: Context<UpdateTripDetails>,
        start_date: i64,
        end_date: i64,
        purpose: String,
        accommodation: Option<String>,
        itinerary: String,
        emergency_contacts: Vec<EmergencyContact>,
    ) -> Result<()> {
        let tourist_account = &mut ctx.accounts.tourist_account;
        let clock = Clock::get()?;

        // Validate that the user owns this account
        require!(
            tourist_account.authority == ctx.accounts.user.key(),
            ErrorCode::Unauthorized
        );

        // Validate trip dates
        require!(end_date > start_date, ErrorCode::InvalidTripDates);
        require!(start_date >= clock.unix_timestamp, ErrorCode::TripInPast);

        // Validate input lengths
        require!(purpose.len() <= 200, ErrorCode::PurposeTooLong);
        require!(itinerary.len() <= 1000, ErrorCode::ItineraryTooLong);
        require!(emergency_contacts.len() <= 5, ErrorCode::TooManyContacts);

        if let Some(ref acc) = accommodation {
            require!(acc.len() <= 300, ErrorCode::AccommodationTooLong);
        }

        // Validate emergency contacts
        for contact in &emergency_contacts {
            require!(contact.name.len() <= 100, ErrorCode::ContactNameTooLong);
            require!(contact.relationship.len() <= 50, ErrorCode::RelationshipTooLong);
            require!(contact.phone.len() <= 20, ErrorCode::ContactPhoneTooLong);
        }

        // Update trip details
        tourist_account.trip_start_date = Some(start_date);
        tourist_account.trip_end_date = Some(end_date);
        tourist_account.purpose = Some(purpose);
        tourist_account.accommodation = accommodation;
        tourist_account.itinerary = Some(itinerary);
        tourist_account.emergency_contacts = emergency_contacts;
        tourist_account.trip_updated_timestamp = clock.unix_timestamp;

        msg!("Trip details updated for digital ID: {}", tourist_account.digital_id);
        msg!("Trip duration: {} to {}", start_date, end_date);

        Ok(())
    }

    /// Deactivate tourist account (when trip ends)
    pub fn deactivate_tourist(ctx: Context<DeactivateTourist>) -> Result<()> {
        let tourist_account = &mut ctx.accounts.tourist_account;
        let clock = Clock::get()?;

        // Validate that the user owns this account
        require!(
            tourist_account.authority == ctx.accounts.user.key(),
            ErrorCode::Unauthorized
        );

        tourist_account.is_active = false;
        tourist_account.deactivation_timestamp = Some(clock.unix_timestamp);

        msg!("Tourist account deactivated for digital ID: {}", tourist_account.digital_id);

        Ok(())
    }

    /// Retrieve tourist data (view function)
    pub fn get_tourist_data(ctx: Context<GetTouristData>) -> Result<()> {
        let tourist_account = &ctx.accounts.tourist_account;

        msg!("Tourist Data Retrieved:");
        msg!("Digital ID: {}", tourist_account.digital_id);
        msg!("Name: {}", tourist_account.name);
        msg!("Nationality: {}", tourist_account.nationality);
        msg!("Active: {}", tourist_account.is_active);
        msg!("Registration: {}", tourist_account.registration_timestamp);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(digital_id: String)]
pub struct RegisterTourist<'info> {
    #[account(
        init,
        payer = user,
        space = TouristAccount::SPACE,
        seeds = [b"tourist", user.key().as_ref(), digital_id.as_bytes()],
        bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTripDetails<'info> {
    #[account(
        mut,
        seeds = [b"tourist", user.key().as_ref(), tourist_account.digital_id.as_bytes()],
        bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateTourist<'info> {
    #[account(
        mut,
        seeds = [b"tourist", user.key().as_ref(), tourist_account.digital_id.as_bytes()],
        bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetTouristData<'info> {
    #[account(
        seeds = [b"tourist", tourist_account.authority.as_ref(), tourist_account.digital_id.as_bytes()],
        bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
}

#[account]
pub struct TouristAccount {
    pub authority: Pubkey,           // 32 bytes
    pub digital_id: String,          // 4 + 50 = 54 bytes
    pub name: String,                // 4 + 100 = 104 bytes
    pub gender: String,              // 4 + 10 = 14 bytes
    pub age: u8,                     // 1 byte
    pub id_number_hash: String,      // 4 + 64 = 68 bytes (SHA256 hash)
    pub phone: String,               // 4 + 20 = 24 bytes
    pub nationality: String,         // 4 + 50 = 54 bytes
    pub email: Option<String>,       // 1 + 4 + 100 = 105 bytes
    pub registration_timestamp: i64, // 8 bytes
    pub blockchain_timestamp: i64,   // 8 bytes
    pub slot: u64,                   // 8 bytes
    pub is_active: bool,             // 1 byte
    pub version: u8,                 // 1 byte
    
    // Trip details (optional)
    pub trip_start_date: Option<i64>,     // 9 bytes
    pub trip_end_date: Option<i64>,       // 9 bytes
    pub purpose: Option<String>,          // 1 + 4 + 200 = 205 bytes
    pub accommodation: Option<String>,    // 1 + 4 + 300 = 305 bytes
    pub itinerary: Option<String>,        // 1 + 4 + 1000 = 1005 bytes
    pub emergency_contacts: Vec<EmergencyContact>, // 4 + (5 * 174) = 874 bytes
    pub trip_updated_timestamp: i64,      // 8 bytes
    pub deactivation_timestamp: Option<i64>, // 9 bytes
}

impl TouristAccount {
    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        54 + // digital_id
        104 + // name
        14 + // gender
        1 + // age
        68 + // id_number_hash
        24 + // phone
        54 + // nationality
        105 + // email
        8 + // registration_timestamp
        8 + // blockchain_timestamp
        8 + // slot
        1 + // is_active
        1 + // version
        9 + // trip_start_date
        9 + // trip_end_date
        205 + // purpose
        305 + // accommodation
        1005 + // itinerary
        874 + // emergency_contacts
        8 + // trip_updated_timestamp
        9; // deactivation_timestamp
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EmergencyContact {
    pub name: String,         // 4 + 100 = 104 bytes
    pub relationship: String, // 4 + 50 = 54 bytes
    pub phone: String,        // 4 + 20 = 24 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name is too long (max 100 characters)")]
    NameTooLong,
    #[msg("Nationality is too long (max 50 characters)")]
    NationalityTooLong,
    #[msg("Phone number is too long (max 20 characters)")]
    PhoneTooLong,
    #[msg("Email is too long (max 100 characters)")]
    EmailTooLong,
    #[msg("Digital ID is too long (max 50 characters)")]
    DigitalIdTooLong,
    #[msg("Invalid age (must be between 1 and 120)")]
    InvalidAge,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid trip dates (end date must be after start date)")]
    InvalidTripDates,
    #[msg("Trip cannot be in the past")]
    TripInPast,
    #[msg("Purpose is too long (max 200 characters)")]
    PurposeTooLong,
    #[msg("Itinerary is too long (max 1000 characters)")]
    ItineraryTooLong,
    #[msg("Accommodation details too long (max 300 characters)")]
    AccommodationTooLong,
    #[msg("Too many emergency contacts (max 5)")]
    TooManyContacts,
    #[msg("Contact name is too long (max 100 characters)")]
    ContactNameTooLong,
    #[msg("Relationship is too long (max 50 characters)")]
    RelationshipTooLong,
    #[msg("Contact phone is too long (max 20 characters)")]
    ContactPhoneTooLong,
}
