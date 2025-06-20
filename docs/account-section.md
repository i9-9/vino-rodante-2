# Account Section Documentation

## Table of Contents
- [Overview](#overview)
- [File Structure](#file-structure)
- [Components](#components)
- [Tabs](#tabs)
- [Server Actions](#server-actions)
- [UI Components](#ui-components)
- [Security](#security)
- [Internationalization](#internationalization)
- [Caching](#caching)
- [Development Notes](#development-notes)

## Overview

The account section provides user account management functionality including profile management, order history, address management, and admin features. It uses Next.js server components with client-side interactivity.

## File Structure

```
app/account/
├── page.tsx                 # Server Component entry point
├── AccountClient.tsx        # Simple client component with logout
├── AccountClientClient.tsx  # Full featured client component
├── admin-orders-table.tsx   # Admin orders table component
└── actions/
    ├── auth-client.ts       # Client-side auth actions
    ├── auth.ts             # Server-side auth actions
    ├── products.ts         # Product management actions
    ├── subscription-plans.ts # Subscription management
    └── admin-orders.ts     # Admin order management
```

## Components

### `page.tsx`
- Server Component
- Handles authentication and redirects
- Loads translations
- Renders AccountClient

### `AccountClient.tsx`
- Client Component
- Handles logout functionality
- Displays basic user information

### `AccountClientClient.tsx`
- Main client component
- Implements all tabs and features
- Handles form submissions and state

## Tabs

### 1. Profile Tab
- User Information Display
  - Email (read-only)
  - Name
  - Profile update form

### 2. Orders Tab
- Order History
  - Order number
  - Date
  - Status
  - Items
  - Pricing
  - Total amount

### 3. Addresses Tab
Features:
- Saved addresses list
- Add new address
- Delete address
- Set default address
- Address form modal

### 4. Admin Tabs
Restricted to admin users:
- Products Management
- Subscription Plans
- Admin Orders Overview

## Server Actions

### Auth Client Actions (`auth-client.ts`)
\`\`\`typescript
export async function getProfile(userId: string)
export async function getOrders(userId: string)
export async function getAddresses(userId: string)
export async function addAddress(userId: string, address: any)
export async function deleteAddress(id: string)
export async function setDefaultAddress(userId: string, id: string)
\`\`\`

### Subscription Plans (`subscription-plans.ts`)
\`\`\`typescript
export async function savePlanAction(
  prevState: { error: string | null, success?: boolean }, 
  formData: FormData
)
\`\`\`

## UI Components

Using shadcn/ui components:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Card`, `CardHeader`, `CardContent`
- `Button`
- `Input`
- `Label`
- `Dialog` components
- `Badge`
- `Table` components
- `Switch`
- `Alert`

## Security

- Route protection via middleware
- Admin role verification
- Secure session handling
- Server-side auth checks

## Internationalization

- Full translation support
- Dynamic text in Spanish and English
- Localized date formatting
- Translation context provider

## Caching

Cache implementation:
- Orders: 2 minute cache
- Addresses: 10 minute cache
- Automatic cache invalidation on updates

## Development Notes

### Current Implementation
- Two main client components:
  1. `AccountClient.tsx`: Simple version with logout
  2. `AccountClientClient.tsx`: Full featured version

### Areas for Improvement
1. Component Unification
   - Merge client components
   - Standardize state management

2. Performance Optimization
   - Implement tab lazy loading
   - Optimize database queries
   - Enhance caching strategy

3. UX Enhancements
   - Add loading states
   - Improve error handling
   - Implement list pagination
   - Enhanced form validation

### Code Examples

#### Profile Update Form
\`\`\`tsx
<form action={handleUpdateProfile} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" value={user.email} disabled />
    <p className="text-sm text-muted-foreground">
      {t.account.emailCannotChange}
    </p>
  </div>
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" name="name" defaultValue={profile?.name} />
  </div>
  <Button type="submit">Update Profile</Button>
</form>
\`\`\`

#### Address Card
\`\`\`tsx
<Card key={address.id}>
  <CardContent className="pt-6">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="font-medium">{address.street}</p>
        <p className="text-sm text-muted-foreground">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm text-muted-foreground">
          {address.country}
        </p>
      </div>
      <div className="flex gap-2">
        {address.is_default ? (
          <Badge variant="secondary">
            <Check className="w-4 h-4 mr-1" />
            {t.common.default}
          </Badge>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetDefaultAddress(address.id)}
          >
            {t.common.setAsDefault}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteAddress(address.id)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
\`\`\` 