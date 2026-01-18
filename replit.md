# LegalAI - Global Legal Guidance Assistant

## Overview

LegalAI is a conversational AI application that provides legal information and guidance based on global legal systems. Users can create chat threads, ask legal questions, and receive structured responses that include applicable laws, legal rights, common legal options, and disclaimers. The application supports multiple languages and detects the user's language to respond appropriately.

The system is designed as an informational tool only—it explicitly does not provide personalized legal advice and encourages users to consult qualified advocates when necessary.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for message transitions
- **Markdown Rendering**: react-markdown for formatted AI responses
- **Theme System**: Custom ThemeProvider with light/dark mode support stored in localStorage

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **AI Integration**: OpenAI API via Replit AI Integrations (environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Build System**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: 
  - `threads` - conversation threads with id, title, createdAt
  - `messages` - individual messages with id, threadId, role (user/assistant), content, createdAt
- **Migrations**: Drizzle Kit with `db:push` command

### API Structure
- `GET /api/threads` - List all conversation threads
- `POST /api/threads` - Create new thread
- `GET /api/threads/:id` - Get single thread
- `GET /api/threads/:threadId/messages` - Get messages for a thread
- `POST /api/threads/:threadId/messages` - Send message and receive AI response

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including chat interface
    hooks/        # Custom React hooks for data fetching
    pages/        # Route pages
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared types and schemas
  schema.ts       # Drizzle database schema
  routes.ts       # API route type definitions
```

### Development vs Production
- Development: Vite dev server with HMR, served via Express middleware
- Production: Static files built to `dist/public`, served by Express

## External Dependencies

### AI Services
- **OpenAI API**: Used for generating legal guidance responses via chat completions
- Configuration through Replit AI Integrations environment variables

### Database
- **PostgreSQL**: Primary data store
- Connection via `DATABASE_URL` environment variable
- Uses Drizzle ORM for type-safe queries

### Key npm Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `@tanstack/react-query` - Data fetching and caching
- `openai` - OpenAI API client
- `react-markdown` - Markdown rendering for AI responses
- `framer-motion` - Animation library
- `date-fns` - Date formatting
- `zod` - Schema validation