# Customer Portal

A modern, full-stack customer portal with authentication, project management, and file uploads.

## 🚀 Features

- **🔐 Secure Authentication**: Email/password with 2FA support (SMS + TOTP)
- **👤 User Management**: Profile management with avatar uploads
- **📋 Project Management**: Create, view, and manage customer projects
- **📝 Project Details**: Comprehensive forms for personal information
- **📁 File Storage**: S3-compatible object storage for avatars
- **🔒 Security**: Rate limiting, input validation, CORS protection
- **🐳 Docker Ready**: Full containerization with Docker Compose
- **📱 Responsive**: Mobile-first design with Tailwind CSS

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify (high-performance, type-safe)
- **Database**: PostgreSQL 16+ with Prisma ORM
- **Cache/Sessions**: Redis 7+
- **Object Storage**: MinIO (S3-compatible)
- **Authentication**: JWT + 2FA (SMS via Twilio, TOTP via speakeasy)
- **Validation**: Zod for runtime type validation

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **UI Library**: Tailwind CSS + Headless UI
- **State Management**: Zustand (lightweight, TypeScript-first)
- **HTTP Client**: TanStack Query + Axios
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Environment**: Docker volumes for persistence
- **Monitoring**: Health checks + structured logging

## 🚦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd your-awesome-project
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Initialize Database**
   ```bash
   # In another terminal
   docker-compose -f docker-compose.dev.yml exec backend npm run prisma:migrate
   docker-compose -f docker-compose.dev.yml exec backend npm run seed
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MinIO Console: http://localhost:9001
   - Database: localhost:5432

### Production Deployment

```bash
docker-compose up --build -d
```

## 🧪 Test Accounts

After running the seed script, you can use these test accounts:

| Email | Password | 2FA Status |
|-------|----------|------------|
| john.doe@example.com | password123! | Disabled |
| jane.smith@example.com | password123! | Enabled |
| mike.johnson@example.com | password123! | Disabled |

## 📋 Available Scripts

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run prisma:migrate # Run database migrations
npm run seed         # Seed development data
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

## 🛠️ Development

### Project Structure
```
├── backend/          # Fastify API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── prisma/
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
├── database/         # Database schema and migrations
├── nginx/           # Reverse proxy configuration
└── docker/          # Docker configurations
```

### Database Schema

- **Users**: Authentication and profile information
- **Projects**: Customer projects with status tracking
- **ProjectDetails**: Detailed personal information per project
- **Sessions**: JWT session management

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (supports 2FA)
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/2fa/generate` - Generate 2FA secret
- `POST /api/auth/2fa/enable` - Enable 2FA
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id/details` - Update project details
- `POST /api/files/avatar` - Upload avatar image

## 🔒 Security Features

- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: API endpoint protection
- **CORS**: Strict origin policies
- **Helmet**: Security headers
- **File Upload Security**: Type validation, size limits
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure HTTP-only cookies
- **2FA Support**: SMS (Twilio) + TOTP (Google Authenticator)

## 🧪 Testing

Run tests for both backend and frontend:

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🚀 Production Considerations

- **Environment Variables**: Set secure values for all secrets
- **SSL/TLS**: Configure HTTPS in production
- **Database**: Use managed PostgreSQL service
- **File Storage**: Configure S3 or compatible service
- **Monitoring**: Set up logging and monitoring
- **Backups**: Regular database and file backups

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.