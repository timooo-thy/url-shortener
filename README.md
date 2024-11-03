# Modern URL Shortener

A high-performance URL shortening service built with Next.js, TypeScript, Hono, Redis, and PostgreSQL.

## 🚀 Features

- Fast URL shortening [x]
- Custom alias support [ ]
- High-performance redirects using Redis caching [x]
- RESTful API built with Hono middleware [x]
- Automatic URL expiration [x]
- Built-in rate limiting [x]
- TypeScript for type safety [x]
- Responsive web interface [ ]

## 🏗️ Architecture

- **Frontend**: Next.js with TypeScript and shadcn/ui
- **API Layer**: Hono middleware for efficient routing (RPC)
- **Caching**: Redis for high-speed lookups
- **Database**: PostgreSQL for permanent storage
- **ORM**: Prisma for type-safe database operations

## 🔧 Technical Highlights

- Redis pipelining for atomic operations
- Efficient caching with automatic TTL refresh
- Database connection pooling
- Edge-ready with Vercel deployment
- Rate limiting using Redis
- Type-safe API endpoints

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/timooo-thy/url-shortener.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Push database changes
npx primsa db push

# Start development server
npm run dev
```
