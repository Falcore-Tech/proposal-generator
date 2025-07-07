# XMA Agency Proposal Generator Documentation

This documentation provides a comprehensive guide for setting up, maintaining, and extending the XMA Proposal Generator application. This internal tool enables team members to create professional marketing proposals with customized packages, services, and pricing for clients.

## Project Setup

### Environment Requirements

- Node.js 18+ 
- npm, yarn, or bun
- Supabase project with authentication enabled

### Environment Variables

Create an `.env.local` file in the root directory with the following variables:

```
# Supabase connection details
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com
# For local development:
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation Steps

1. Clone the repository from the company's Git repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```
4. Access the application at http://localhost:3000

### Creating an Admin User

To create an initial admin user, use the provided script:

```bash
npm run seed:admin admin@xmaagency.com your-secure-password
```

This will create a user with admin privileges that can access the system.

## Database Architecture

The application uses Supabase as its backend, with the following table structure:

### Core Tables

1. **packages**: Contains marketing package offerings
   - `id` (UUID): Primary key
   - `name` (TEXT): Package name (e.g., "Base", "Standard", "Premium")
   - `price` (DECIMAL): Package price
   - `currency` (TEXT): Currency code, default "AED"
   - `usd_price` (DECIMAL): Price in USD (for reference)
   - `is_popular` (BOOLEAN): Highlighted as popular
   - `description` (TEXT): Package description
   - `created_at`, `updated_at`: Timestamps

2. **package_features**: Features included in each package
   - `id` (UUID): Primary key
   - `package_id` (UUID): Foreign key to packages
   - `text` (TEXT): Feature description
   - `is_bold` (BOOLEAN): Whether text should be displayed boldly
   - `is_included` (BOOLEAN): Whether feature is included
   - `order_index` (INTEGER): Display order

3. **services**: Additional services that can be added to proposals
   - `id` (UUID): Primary key
   - `name` (TEXT): Service name
   - `price` (DECIMAL): Service price
   - `currency` (TEXT): Currency code, default "AED"
   - `description` (TEXT): Service description
   - `is_monthly` (BOOLEAN): Whether service has recurring fees
   - `setup_fee` (DECIMAL): Monthly fee if applicable
   - `created_at`, `updated_at`: Timestamps

4. **clients**: Client information
   - `id` (UUID): Primary key
   - `name` (TEXT): Client contact name
   - `company_name` (TEXT): Company name
   - `email` (TEXT): Contact email
   - `phone` (TEXT): Contact phone
   - `created_at`, `updated_at`: Timestamps

5. **proposals**: Main proposal data
   - `id` (UUID): Primary key
   - `client_id` (UUID): Foreign key to clients
   - `title` (TEXT): Proposal title
   - `client_name` (TEXT): Client contact name
   - `company_name` (TEXT): Company name
   - `proposal_date` (DATE): Date of proposal
   - `additional_info` (TEXT): Custom notes
   - `include_package` (BOOLEAN): Whether a package is included
   - `package_id` (UUID): Foreign key to packages
   - `package_discount_type` (TEXT): Percentage or absolute
   - `package_discount_value` (DECIMAL): Discount amount
   - `overall_discount_type` (TEXT): Percentage or absolute
   - `overall_discount_value` (DECIMAL): Discount amount
   - `status` (TEXT): Proposal status (draft, sent, etc.)
   - `proposal_data` (JSONB): Complete proposal snapshot
   - `encoded_data` (TEXT): Base64 encoded data for URL sharing
   - `order_id` (TEXT): Unique order ID (e.g., XMA-2025-04-00001)
   - `include_tax` (BOOLEAN): Whether to include VAT
   - `created_at`, `updated_at`: Timestamps

6. **proposal_services**: Junction table for services in proposals
   - `id` (UUID): Primary key
   - `proposal_id` (UUID): Foreign key to proposals
   - `service_id` (UUID): Foreign key to services
   - `discount_type` (TEXT): Percentage or absolute
   - `discount_value` (DECIMAL): Discount amount

7. **proposal_links**: Shared links for proposals
   - `id` (UUID): Primary key
   - `proposal_id` (UUID): Foreign key to proposals
   - `token` (TEXT): Unique token for accessing proposal
   - `views_count` (INTEGER): Number of times proposal was viewed
   - `created_at`: Timestamp

8. **profiles**: User profiles for administrators
   - `id` (UUID): Primary key (matches auth.users id)
   - `email` (TEXT): User email
   - `name` (TEXT): User name
   - `avatar_url` (TEXT): Profile picture URL
   - `role` (TEXT): User role (admin, user)
   - `created_at`, `updated_at`: Timestamps

### Project Structure

- `app/` - Next.js app router pages and layouts
  - `(admin)/` - Admin-only routes (proposals list, generator)
  - `(legal)/` - Terms and privacy policy pages
  - `api/` - API routes for backend functionality
  - `auth/` - Authentication-related pages and routes
  - `proposal/` - Public proposal viewing page

- `components/` - React components
  - `admin/` - Administrative interface components
  - `auth/` - Authentication components (login, providers)
  - `proposal/` - Proposal-related components
  - `ui/` - Reusable UI components (buttons, forms, etc.)

- `lib/` - Utility functions and services
  - `auth-utils.ts` - Authentication helpers
  - `orderIdGenerator.ts` - Order ID generation logic
  - `proposalUtils.ts` - Proposal calculation utilities
  - `supabase.ts` - Supabase client and data operations

- `public/` - Static assets
  - Logo files, images, and other public resources

- `utils/` - Helper utilities
  - `supabase/` - Supabase client utilities for different contexts

- `types/` - TypeScript type definitions
  - `supabase.ts` - Database type definitions

- `scripts/` - Helper scripts
  - `seed-admin.js` - Script for creating admin users

- `middleware.ts` - Next.js middleware for auth and routing
  
- `data/` - Static data definitions
  - `proposalData.ts` - Default proposal template data
  - `adCarousel.ts` - Ad showcase data
```

## Key Features Explained

### Order ID Generation

The system automatically generates structured order IDs (e.g., XMA-2025-04-00001):

```javascript
// lib/orderIdGenerator.ts
export function generateOrderId(sequentialNumber: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(sequentialNumber).padStart(5, "0");

  return `XMA-${year}-${month}-${sequence}`;
}
```

This creates a consistent format with:
- Company prefix (XMA)
- Year (e.g., 2025)
- Month (e.g., 04 for April)
- Sequential number (e.g., 00001)

### Proposal Data Storage

Each proposal is stored with two approaches:
1. **Relational data**: Key information stored in normalized tables for filtering and reporting
2. **JSON snapshot**: Complete proposal data stored as JSON for rendering

This dual approach ensures:
- Fast queries for listings and filters
- Complete data preservation regardless of future schema changes
- Reliable rendering of historical proposals

### Discount System

The application supports a sophisticated discount system:
- **Package discounts**: Applied to the selected package
- **Service discounts**: Applied individually to services
- **Overall discounts**: Applied to the entire proposal

Each discount can be:
- **Percentage-based**: e.g., 10% off
- **Fixed amount**: e.g., 500 AED off

### Authentication and Authorization

The application uses Supabase Auth with custom profile roles:
- **Admin**: Can create and manage proposals
- **Guest**: Can view shared proposals via tokens

RLS (Row Level Security) policies in Supabase ensure proper data access.

## Common Tasks

### Adding New Packages

1. Go to the Supabase Dashboard > Table Editor > `packages`
2. Click "Insert row" and fill in the details:
   - Name (e.g., "Enterprise")
   - Price
   - Currency (default "AED")
   - USD Price (for reference)
   - Description
   - Toggle "is_popular" if it should be highlighted

3. Then go to `package_features` to add features:
   - Select the newly created package ID
   - Add feature text
   - Set whether it's bold, included
   - Set the display order (1, 2, 3, etc.)

### Adding New Services

1. Go to the Supabase Dashboard > Table Editor > `services`
2. Click "Insert row" and fill in the details:
   - Name
   - Price
   - Currency
   - Description
   - Toggle "is_monthly" if it has recurring fees
   - Setup fee (if applicable)

### Modifying the User Interface

Most UI components are in the `/components` directory:

- For proposal page layout: Edit components in `/components/proposal/`
- For admin interfaces: Edit components in `/components/admin/`
- For shared UI elements: Edit components in `/components/ui/`

### Adding an Admin User

1. First create a user in Supabase Auth (or have them sign up)
2. Then use the admin script to assign admin role:

```bash
npm run seed:admin user@example.com password
```

Or manually in Supabase:

1. Go to Supabase Dashboard > Table Editor > `profiles`
2. Find the user by ID or email
3. Set their `role` column to "admin"

## Deployment

### Production Setup

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

For continuous deployment, set up a CI/CD pipeline with GitHub Actions or similar.

### Environment Configuration

For production, ensure these environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL` (set to the production URL)

## Maintenance

### Regular Database Backups

Schedule regular backups of your Supabase database:
1. Go to Supabase Dashboard > Project Settings > Database
2. Under "Database Backups", click "Create manual backup"
3. Download and store securely

### Dependency Updates

Periodically update dependencies for security and features:

```bash
npm outdated
npm update
```

Review package.json after updates and test thoroughly.

## Troubleshooting

### Authentication Issues

- Check Supabase logs for auth failures
- Verify environment variables are correctly set
- Ensure user roles are properly assigned in profiles table

### Proposal Generation Issues

- Check browser console for JavaScript errors
- Verify Supabase connection is working
- Ensure packages and services exist in the database

### Missing Components or Styles

- Run `npm install` to ensure all dependencies are installed
- Check that CSS files are being loaded correctly
- Clear browser cache or try in incognito mode

## Contact and Support

For internal support with this application, contact:
- Technical issues: Development Team
- Content/pricing updates: Marketing Team
- User access: IT Department

## License

This is proprietary software owned by XMA Agency. All rights reserved.
