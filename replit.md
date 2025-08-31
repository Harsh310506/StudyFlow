# StudyFlow - Student Task Management System

## Overview

StudyFlow is a student-focused task management web application designed to help college and higher secondary students organize their daily and upcoming tasks. The application provides a comprehensive solution for academic task management with features like multi-level completion tracking (pending, partial, half, complete), calendar integration, progress analytics, and user authentication.

The system follows a full-stack architecture with a React frontend using TypeScript and Vite, an Express.js backend with Node.js, and PostgreSQL database management through Drizzle ORM. The application is designed with a clean, student-friendly interface using Shadcn/UI components and Tailwind CSS for responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/UI components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system supporting light/dark themes
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation and type safety

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **API Design**: RESTful endpoints with consistent error handling and response formatting
- **Middleware**: Custom logging, authentication, and error handling middleware

### Database Schema Design
The application uses a relational database structure with two main entities:

**Users Table**:
- Primary key with UUID generation
- Email-based authentication with unique constraints
- Encrypted password storage
- User profile information (first name, last name)
- Timestamp tracking for account creation

**Tasks Table**:
- Foreign key relationship to users with cascade deletion
- Comprehensive task metadata (title, description, due date/time)
- Priority levels (low, medium, high) and categories (assignment, exam, project, personal)
- Multi-level completion status (pending, partial, half, complete)
- Support for both date-specific and overall tasks
- Reminder preferences (email and push notifications)
- Automatic timestamp tracking for creation and updates

### Authentication & Authorization
- JWT token-based authentication stored in localStorage
- Protected route components that verify authentication status
- Automatic token validation on API requests
- Secure password hashing using bcrypt with salt rounds
- Session management with automatic logout on token expiration

### Data Flow Architecture
- Client-side React Query for data fetching, caching, and synchronization
- Optimistic updates for improved user experience
- Background data refetching for real-time updates
- Error boundary handling for graceful error recovery
- Consistent API response patterns for predictable data handling

### Development Architecture
- Shared schema definitions between frontend and backend using Zod
- Hot module replacement in development with Vite
- TypeScript path mapping for clean import statements
- Modular component structure with separation of concerns
- Custom hooks for business logic abstraction

## External Dependencies

### Core Technologies
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **TanStack React Query**: Advanced server state management and caching
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Wouter**: Lightweight routing library for single-page applications

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Shadcn/UI**: Pre-built component library with consistent design system
- **Class Variance Authority**: Dynamic className generation for component variants
- **Lucide React**: Consistent icon library with tree-shaking support

### Development Tools
- **Vite**: Modern build tool with fast development server and optimized builds
- **TypeScript**: Static type checking throughout the entire application stack
- **React Hook Form**: Efficient form handling with minimal re-renders
- **Zod**: Runtime type validation and schema definition

### Authentication & Security
- **JSON Web Tokens (jsonwebtoken)**: Stateless authentication mechanism
- **bcrypt**: Secure password hashing with configurable salt rounds
- **React Query Authentication**: Automatic token management and validation

### Database Infrastructure
- **PostgreSQL**: Robust relational database with ACID compliance
- **Connection Pooling**: Efficient database connection management
- **Migration System**: Version-controlled database schema changes through Drizzle