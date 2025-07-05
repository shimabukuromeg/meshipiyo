# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

meshipiyo is a restaurant/food discovery platform built as a monorepo using pnpm workspaces and Turborepo. It consists of:
- **Frontend**: Next.js 15 application (port 33000) with React 19, Tailwind CSS, and GraphQL client
- **Backend**: GraphQL API (port 44000) using GraphQL Yoga, Prisma ORM, and PostgreSQL with PGroonga for full-text search

## Essential Commands

### Initial Setup
```bash
pnpm i                    # Install all dependencies
docker compose up -d db   # Start PostgreSQL database (port 55432)
pnpm backend db:migrate:dev  # Run database migrations
```

### Development
```bash
pnpm dev                  # Start all services (frontend + backend)
pnpm frontend dev         # Start only frontend (http://localhost:33000)
pnpm backend dev          # Start only backend (http://localhost:44000)
```

### Code Generation (Run when GraphQL schema or database schema changes)
```bash
pnpm backend codegen      # Generate backend types (Prisma + GraphQL)
pnpm frontend codegen     # Generate frontend GraphQL types
```

### Testing & Quality Checks
```bash
pnpm test                 # Run all tests
pnpm lint                 # Lint all code
pnpm format               # Format code with Biome
pnpm typecheck            # TypeScript type checking
pnpm ci                   # Run all CI checks
```

### Database Management
```bash
pnpm backend db:migrate:dev     # Create and run new migrations
pnpm backend db:migrate:deploy  # Deploy migrations to production
pnpm backend db:studio          # Open Prisma Studio GUI
pnpm backend db:migrate:reset   # Reset database (WARNING: deletes all data)
```

## Architecture Overview

### Data Flow
1. PostgreSQL database stores restaurant (Meshi) data organized by Municipality
2. Backend GraphQL API serves data with cursor-based pagination and search
3. Frontend queries GraphQL API and implements server-side rendering
4. Search functionality uses PGroonga extension for Japanese full-text search

### Key Features

- Global search with autocomplete and recent/trending searches
- Municipality-based restaurant organization
- Cursor-based pagination for efficient data loading
- Server-side rendering with Next.js API routes for caching

### Code Organization

- `/apps/frontend/`: Next.js application
  - `/app/`: App router pages and API routes
  - `/components/`: React components (using Radix UI)
  - `/hooks/`: Custom React hooks (search, pagination)
  - `/lib/`: Utilities and GraphQL client setup
- `/apps/backend/`: GraphQL API server
  - `/src/graphql/`: GraphQL schema and resolvers
  - `/src/services/`: Business logic
  - `/prisma/`: Database schema and migrations
- `/docker/`: Docker configuration files

### Type Safety
The project uses code generation extensively:
- Prisma generates TypeScript types from database schema
- GraphQL Code Generator creates types from GraphQL schema
- **CRITICAL**: Always run codegen commands after schema changes to maintain type safety
- **IMPORTANT**: After modifying any GraphQL schema files (*.graphql), you MUST run `pnpm --filter backend codegen` before starting the backend server

### Important Notes
- Frontend uses `graphql-request` for API calls, not Apollo or Relay
- Backend uses cursor-based pagination (not offset-based)
- Search queries go through the `/api/meshi/search` endpoint for caching
- The project uses Biome for formatting and linting (not ESLint/Prettier)
- All GraphQL queries should be defined in `.graphql` files for code generation

## 🚀 Recently Implemented Features (2025-01-05)

### Like & MyPage System (COMPLETE)
A comprehensive like and user profile system has been implemented:

#### Database Layer
- **Like table**: User-Meshi relationship with unique constraints and performance indexes
- **User.likeCount field**: Real-time like count for user profiles
- **Meshi.isLiked/likeCount fields**: Like status and counts for restaurants

#### Backend API
- **GraphQL Schema**: Like, LikeConnection, LikeEdge types with cursor-based pagination
- **LikeService**: Business logic for CRUD operations with N+1 prevention
- **Resolvers**: Complete implementation with authentication checks
- **Mutations**: `likeMeshi`, `unlikeMeshi` with error handling
- **Queries**: `myLikes` with infinite scroll support

#### Frontend Features
- **LikeButton Component**: Heart icon with optimistic updates and animations
- **MyPage Route** (`/mypage`): Complete user profile and liked items display
- **Infinite Scroll**: Intersection Observer implementation for liked items list
- **Authentication Integration**: Firebase token management and login redirects

#### Key Technical Implementations
- ✅ N+1 query prevention using DataLoader patterns
- ✅ Optimistic UI updates with error rollback
- ✅ Cursor-based pagination for performance
- ✅ Type-safe GraphQL integration throughout the stack
- ✅ Comprehensive unit tests for service layer

### Usage
- Users can like/unlike restaurants from any Meshi card
- Authenticated users get redirected to login when not signed in
- MyPage displays user profile with total like count
- Liked restaurants are displayed with infinite scroll pagination
- Real-time like counts update across the UI

## Interaction Guidelines
- **IMPORTANT**: 日本語で会話してください