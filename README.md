# VowSwap - Wedding Marketplace

VowSwap is a marketplace platform that enables people to buy and sell secondhand wedding materials—such as wedding dresses, decor, and other wedding-related items—to make wedding planning more sustainable and affordable.

## Project Overview

VowSwap aims to create a sustainable wedding ecosystem by connecting sellers of pre-loved wedding items with buyers looking for affordable options. The platform focuses on:

- Wedding dresses
- Decorations
- Accessories
- Stationery
- Wedding gifts

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Email**: SendGrid
- **Styling**: TailwindCSS
- **Payment Processing**: Stripe (planned)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Clerk account
- SendGrid account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Fill in the required environment variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SendGrid
SENDGRID_KEY=your_sendgrid_key

# Database Selection
DATABASE_TYPE=supabase
```

### Database Setup

1. Run the database migration to set up the wedding marketplace schema:

```bash
npm run migrate
```

Alternatively, you can run the SQL directly in the Supabase dashboard.

### Testing

We have comprehensive tests for the database migration:

```bash
# Run all tests
npm run migrate:test:all

# Run specific test suites
npm run test:migration
npm run test:data
npm run test:rollback
npm run test:api

# Run tests with coverage
npm run test:coverage
```

For detailed testing information, see [migrations/TESTING.md](migrations/TESTING.md).

### Installation

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Features

### Current MVP Features

- User authentication and profiles
- Listing creation and management
- Browse and search listings
- Filtering by category, price, and condition
- Messaging between buyers and sellers

### Planned Features

- Secure payment processing
- Seller verification
- Size guide for wedding dresses
- Measurement input system
- Shipping calculator
- Vendor services marketplace

## Project Structure

- `/libs` - Utility libraries and connections
- `/models` - Data models
- `/migrations` - Database migrations
- `/src/app` - Next.js app router pages
- `/src/Components` - React components
- `/public` - Static assets

## Development Roadmap

### Phase 1: Data Model Restructuring
- Update database schema for wedding-specific attributes
- Implement new data models
- Create migration scripts
- Develop comprehensive test suite for database migrations
- Implement CI/CD pipeline for database testing

### Phase 2: UI/UX Transformation
- Update branding and messaging
- Implement wedding-specific filters and categories
- Create specialized product views

### Phase 3: Feature Implementation
- Add secure payment processing
- Implement seller verification
- Create category management system
- Add size guide and measurement system
- Develop shipping calculator

### Phase 4: Optimization & Refinement
- Performance optimizations
- Code refactoring
- Comprehensive testing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
