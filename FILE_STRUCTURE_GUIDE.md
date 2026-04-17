# Gengar's Haunted Mansion - File Structure Guide

A comprehensive breakdown of the project structure and purpose of each file/directory.

---

## 📁 Root Level Files

### `package.json`
- **Purpose**: Workspace-level package configuration for the monorepo
- **Key Scripts**:
  - `dev`: Runs both backend and frontend concurrently
  - `backend`: Starts only the backend server
  - `setup`: Installs dependencies for root, backend, and frontend
  - `update`: Upgrades all dependencies across the project
- **Dependencies**: Uses `concurrently` to run multiple dev servers simultaneously

### `README.md`
- **Purpose**: Main project documentation
- **Contains**: 
  - Project overview and purpose
  - Tech stack explanations (Next.js, Redux, TailwindCSS, MongoDB, Express)
  - Getting started instructions
  - Development setup guide

### `yarn.lock`
- **Purpose**: Lock file to ensure consistent dependency versions across installations

### `.gitignore`
- **Purpose**: Specifies files/folders Git should ignore (node_modules, .env, etc.)

### `.vscode/`
- **Purpose**: VS Code workspace settings and configurations

---

## 🔧 Backend Directory

The Express.js/Node.js server handling API requests and MongoDB connections.

### `backend/index.js`
- **Purpose**: Main server entry point
- **Functionality**:
  - Initializes Express app on port 5000
  - Sets up CORS for cross-origin requests
  - Configures middleware for JSON parsing
  - Defines root route returning "Gengar's Haunted Mansion API"
  - Mounts Pokemon routes at `/pokemon`
  - Error handling middleware

### `backend/package.json`
- **Purpose**: Backend dependencies and scripts
- **Key Dependencies**:
  - `express`: Web framework
  - `mongoose`: MongoDB ODM
  - `cors`: Enable cross-origin resource sharing
  - `dotenv`: Environment variable management
  - `colors`: Terminal color formatting
  - `express-async-handler`: Async error handling
- **Scripts**:
  - `start`: Runs server with nodemon for auto-reload

### `backend/vercel.json`
- **Purpose**: Configuration for Vercel deployment
- **Contains**: Build settings and route configurations

### `backend/.env`
- **Purpose**: Environment variables (MongoDB URI, PORT, NODE_ENV)
- **Security**: Not committed to Git

### `backend/src/` Directory Structure

#### `src/errors/`
- **Purpose**: Custom error handling middleware
- **Contains**: 
  - Error handler functions
  - 404 Not Found middleware
  - Custom error response formatting

#### `src/models/`
- **Purpose**: Mongoose schemas and models
- **Contains**: MongoDB data models (likely Pokemon model definitions)

#### `src/routes/`
- **Purpose**: API endpoint definitions
- **Contains**: 
  - Route handlers for Pokemon endpoints
  - RESTful API route organization

#### `src/guides/`
- **Purpose**: Internal documentation or helper guides for backend development

---

## 🎨 Frontend Directory

Next.js 13+ application with App Router, TypeScript, and TailwindCSS.

### Frontend Configuration Files

#### `frontend/package.json`
- **Purpose**: Frontend dependencies and scripts
- **Key Dependencies**:
  - `next`: React framework with SSR
  - `react` & `react-dom`: React library
  - `@reduxjs/toolkit` & `react-redux`: State management
  - `@headlessui/react`: Accessible UI components
  - `@heroicons/react`: Icon library
  - `framer-motion`: Animation library
  - `tailwindcss`: Utility-first CSS
  - `@mdx-js/loader` & `@next/mdx`: MDX support for content
- **Scripts**:
  - `dev`: Development server (localhost:3000)
  - `build`: Production build
  - `start`: Production server
  - `test`: Jest test runner
  - `type-check`: TypeScript type checking

#### `frontend/next.config.js`
- **Purpose**: Next.js configuration
- **Features**:
  - MDX support for markdown files
  - Custom page extensions (includes .mdx)
  - App directory experimental features

#### `frontend/tailwind.config.js`
- **Purpose**: TailwindCSS configuration
- **Contains**: Theme customization, plugins, custom utilities

#### `frontend/postcss.config.js`
- **Purpose**: PostCSS configuration for CSS processing

#### `frontend/tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Contains**: Path aliases, compiler options, includes/excludes

#### `frontend/tsconfig.test.json`
- **Purpose**: Separate TypeScript config for Jest tests

#### `frontend/jest.config.ts`
- **Purpose**: Jest testing framework configuration

#### `frontend/setupTests.ts`
- **Purpose**: Test environment setup (runs before tests)

#### `frontend/.eslintrc.json`
- **Purpose**: ESLint rules for code quality and consistency

#### `frontend/next-env.d.ts`
- **Purpose**: Next.js TypeScript declarations (auto-generated)

#### `frontend/.env`
- **Purpose**: Frontend environment variables (API URLs, etc.)

### Frontend Source Directories

#### `frontend/app/`
Next.js 13 App Router directory - file-based routing system

##### `app/layout.tsx`
- **Purpose**: Root layout component
- **Functionality**:
  - Wraps all pages with consistent header/footer
  - Defines global metadata (title, description)
  - Applies global CSS
  - Dark theme background (bg-gray-900)

##### `app/page.tsx`
- **Purpose**: Home page component (route: `/`)
- **Contains**: Landing page content

##### `app/loading.jsx`
- **Purpose**: Loading UI shown during route transitions

##### `app/globals.css`
- **Purpose**: Global CSS styles and Tailwind directives

##### `app/_constants/`
- **Purpose**: App-wide constants and configuration
- **Contains**: Shared constants used across components

##### `app/components/`
- **Purpose**: Reusable React components
- **Contains**: 
  - Layout components (Header, Footer)
  - Pokemon components (PokemonSearchBar)
  - Shared UI components

##### `app/about/`
- **Purpose**: About page route (`/about`)
- **Contains**: About page components and content

##### `app/articles/`
- **Purpose**: Articles/blog route (`/articles`)
- **Contains**: Article listing and article page templates

##### `app/pokemon/`
- **Purpose**: Pokemon-related pages (`/pokemon`)
- **Contains**: Pokemon search, display, and detail pages

##### `app/api/`
- **Purpose**: Next.js API routes (serverless functions)
- **Contains**: Backend API endpoints for frontend

#### `frontend/articles/`
- **Purpose**: MDX article content files
- **Structure**:
  - `landing-page.mdx`: Landing page content
  - `about-page.mdx`: About page content
  - `pokemon/`: Pokemon-related articles
  - `destiny-2/`: Destiny 2 game articles
  - `main/`: Main blog articles
- **Format**: MDX (Markdown + JSX components)

#### `frontend/data/`
- **Purpose**: Static data files and JSON
- **Contains**:
  - `articles.js`: Article metadata and listings
  - `*.mdx`: MDX content files
  - `pokemon/`: Pokemon data files
  - `downloads/`: Downloadable resources

#### `frontend/helperFunctions/`
- **Purpose**: Utility functions and helpers
- **Contains**:
  - `baseStatsFunctions.js`: Pokemon stats calculations
  - `createSearchQuery.js`: Search query builder
  - `pokedexOnFilterSubmit.js`: Pokedex filtering logic

#### `frontend/public/`
- **Purpose**: Static assets served at root URL
- **Contains**:
  - `favicon.ico`: Browser tab icon
  - `logo.svg`: Site logo
  - `destiny.svg`: Destiny-related graphics
  - `pokemon/`: Pokemon images and sprites
  - `sprites/`: Character/game sprites
  - `hires/`: High-resolution images

#### `frontend/.next/`
- **Purpose**: Next.js build output (auto-generated)
- **Note**: Not committed to Git, created during `npm run build`

---

## 🏗️ Project Architecture

### Technology Stack

**Frontend**:
- ⚛️ **Next.js 13**: React framework with App Router and SSR
- 🎨 **TailwindCSS**: Utility-first CSS framework
- 📝 **TypeScript**: Type-safe JavaScript
- 🔄 **Redux Toolkit**: State management
- 📄 **MDX**: Markdown with JSX for content
- 🎭 **Framer Motion**: Animations
- 🧪 **Jest**: Testing framework

**Backend**:
- 🟢 **Node.js**: JavaScript runtime
- ⚡ **Express**: Web server framework
- 🍃 **MongoDB + Mongoose**: Database and ODM
- 🔐 **CORS**: Cross-origin resource sharing

### Development Workflow

1. **Setup**: Run `yarn setup` to install all dependencies
2. **Development**: Run `yarn dev` to start both servers
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`
3. **Backend Only**: Run `yarn backend` for API development
4. **Testing**: Run `npm test` in frontend directory

### Key Features

- 🎮 **Pokemon Database**: Search and display Pokemon data
- 📰 **Blog/Articles**: MDX-powered content system
- 🎨 **Dark Theme**: Styled with TailwindCSS
- 🔍 **Search Functionality**: Pokemon search with filters
- 📱 **Responsive Design**: Mobile-friendly layouts
- ⚡ **SSR**: Server-side rendering for better performance
- 🔄 **State Management**: Redux for complex state

---

## 📝 Notes

- **Database Connection**: Requires `DB_CONNECTION` in `.env` to connect to MongoDB
- **Deployment**: Configured for Vercel deployment
- **Branch**: Currently on branch `20230901-Archer`
- **Monorepo Structure**: Root manages both frontend and backend workspaces

---

## 🚀 Quick Start Commands

```bash
# Install all dependencies
yarn setup

# Run development environment (both servers)
yarn dev

# Run only backend
yarn backend

# Update all dependencies
yarn update

# Frontend testing
cd frontend && npm test

# Type checking
cd frontend && npm run type-check
```

---

**Last Updated**: February 3, 2026
**Project**: Gengar's Haunted Mansion
**Repository**: Fenrisulfr-33/gengars_haunted_mansion
