# 🤖 ClientSync - AI-Powered Customer Support Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.1-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-black?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
</div>

<div align="center">
  <h3>🚀 Transform Your Customer Support with AI-Powered Automation</h3>
  <p>A multi-tenant SaaS platform that revolutionizes customer support through intelligent AI chatbots trained on your custom knowledge base.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ClientSync** is a cutting-edge SaaS platform designed to automate and enhance customer support operations through AI-powered chatbots. Built with a multi-tenant architecture, it allows businesses to:

- **Train Custom AI Models** with their specific knowledge base
- **Automate Customer Queries** with intelligent responses
- **Scale Support Operations** without increasing headcount
- **Provide 24/7 Support** with consistent quality
- **Analyze Support Metrics** with detailed insights

### 🎯 Why ClientSync?

- **🤖 AI-First Approach**: Leverage advanced LLMs for natural conversations
- **📊 Multi-Tenant SaaS**: Secure, scalable architecture for multiple organizations
- **📚 Custom Training**: Upload and train on your specific documentation and FAQs
- **⚡ Real-Time Responses**: Instant, accurate answers to customer queries
- **📈 Analytics Dashboard**: Track performance, satisfaction, and key metrics
- **🔧 Easy Integration**: Simple APIs and embeddable widgets

---

## ✨ Features

### 🏢 **Multi-Tenant Organization Management**
- Secure subdomain-based tenant isolation
- Organization-specific settings and customization
- User role management and permissions

### 🤖 **AI-Powered Chatbots**
- Custom-trained AI models per organization
- Natural language processing and understanding
- Context-aware conversations with memory
- Fallback to human agents when needed

### 📚 **Knowledge Base Management**
- Upload documents (PDF, DOCX, TXT, CSV)
- Automatic text extraction and processing
- Vector embeddings for semantic search
- Version control for knowledge updates

### 💬 **Real-Time Chat Interface**
- Embeddable chat widgets for websites
- Mobile-responsive design
- Multi-language support
- Rich media support (images, files)

### 📊 **Analytics & Insights**
- Conversation analytics and metrics
- Customer satisfaction tracking
- Performance dashboards
- Export capabilities for reporting

### 🔧 **Developer-Friendly**
- RESTful APIs with comprehensive documentation
- Webhook support for integrations
- SDKs for popular programming languages
- OpenAPI/Swagger specifications

---

## 🛠 Tech Stack

### **Frontend** (Next.js)
- **Framework**: Next.js 15.x with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Shadcn/ui + Radix UI
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod

### **Backend** (Node.js)
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Language**: TypeScript 5.x
- **Database ORM**: Prisma 5.x
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit

### **Database & Infrastructure**
- **Database**: PostgreSQL 15.x
- **Vector Database**: Pinecone (for embeddings)
- **File Storage**: AWS S3 / Local Storage
- **Caching**: Redis (optional)
- **Monitoring**: Sentry
- **Email**: SendGrid / Nodemailer

### **AI & ML**
- **LLM Provider**: OpenAI GPT-4 / Google AI
- **Embeddings**: OpenAI text-embedding-ada-002
- **Vector Search**: Semantic similarity matching
- **Text Processing**: Natural language processing

---

## 🏗 Architecture

```mermaid
graph TB
    Client[Web Client] --> Frontend[Next.js Frontend]
    Widget[Chat Widget] --> Frontend
    Frontend --> API[Express.js API]
    API --> DB[(PostgreSQL)]
    API --> Vector[(Vector DB)]
    API --> AI[AI/ML Services]
    API --> Storage[File Storage]
    API --> Cache[(Redis Cache)]
```

### **Multi-Tenant Design**
- **Subdomain Routing**: `{tenant}.clientsync.com`
- **Data Isolation**: Organization-scoped database queries
- **Resource Isolation**: Per-tenant rate limiting and quotas

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (latest version)
- **PostgreSQL** (v15.x or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### **Optional but Recommended:**
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/)
- **Redis** (for caching) - [Download](https://redis.io/download)

---

## 🚀 Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/clientsync.git
cd clientsync
```

### 2. **Install Dependencies**

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

---

## 🔧 Environment Setup

### **Backend Environment**

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/clientsync?schema=public"

# JWT Secret (use a strong, random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# AI Configuration
OPENAI_API_KEY="your-openai-api-key"
# OR
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# File Upload
MAX_FILE_SIZE="10mb"
UPLOAD_DIR="./uploads"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### **Frontend Environment**

Create `.env.local` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT_WIDGET=true
```

---

## 🗄 Database Setup

### **Using Local PostgreSQL**

1. **Create Database**:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE clientsync;

# Create user (optional)
CREATE USER clientsync_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE clientsync TO clientsync_user;

# Exit
\q
```

2. **Run Migrations**:
```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### **Using Docker (Alternative)**

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait for database to be ready, then run migrations
cd backend
npm run prisma:migrate
```

---

## 🏃‍♂️ Running the Application

### **Development Mode**

You can run both frontend and backend simultaneously:

#### **Option 1: Run Both Services**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

#### **Option 2: Using Concurrently (if configured)**
```bash
# From root directory
npm run dev
```

### **Production Mode**

```bash
# Build and start backend
cd backend
npm run build
npm start

# Build and start frontend
cd frontend
npm run build
npm start
```

### **Using Docker**

```bash
# Build and run all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

---

## 📖 Access the Application

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

### **Test Accounts**

After seeding the database, you can use these test accounts:

```
Organization: demo-company
Email: admin@demo.com
Password: password123
```

---

## 📚 API Documentation

The API is fully documented using OpenAPI/Swagger:

- **Interactive Documentation**: http://localhost:3001/api/docs
- **JSON Schema**: http://localhost:3001/api/docs.json

### **Key API Endpoints**

```bash
# Authentication
POST /api/auth/register     # Register organization
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user

# Organizations
GET  /api/organizations     # Get organization details
PUT  /api/organizations     # Update organization

# Chatbots
GET  /api/chatbots         # List chatbots
POST /api/chatbots         # Create chatbot
GET  /api/chatbots/:id     # Get specific chatbot

# Chat
POST /api/chat/message     # Send message to chatbot
GET  /api/chat/history     # Get conversation history
```

---

## 📁 Project Structure

```
clientsync/
├── 📁 backend/                 # Node.js Express API
│   ├── 📁 src/
│   │   ├── 📁 routes/         # API route handlers
│   │   ├── 📁 middleware/     # Express middleware
│   │   ├── 📁 utils/          # Utility functions
│   │   ├── 📁 config/         # Configuration files
│   │   └── 📁 services/       # Business logic services
│   ├── 📁 prisma/             # Database schema & migrations
│   ├── 📁 uploads/            # File upload directory
│   └── 📄 package.json
│
├── 📁 frontend/               # Next.js React Application
│   ├── 📁 src/
│   │   ├── 📁 app/           # Next.js App Router
│   │   ├── 📁 components/    # React components
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 lib/           # Utility libraries
│   │   ├── 📁 stores/        # State management
│   │   └── 📁 types/         # TypeScript type definitions
│   ├── 📁 public/            # Static assets
│   └── 📄 package.json
│
├── 📁 docs/                  # Documentation
├── 📄 docker-compose.yml     # Docker services
├── 📄 .gitignore
└── 📄 README.md
```

---

## 🛠 Development

### **Code Quality**

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Format code
npm run format
```

### **Testing**

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### **Database Management**

```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:reset

# Generate new migration
npm run prisma:migrate:dev

# Deploy migrations to production
npm run prisma:migrate:deploy
```

---

## 🚀 Deployment

### **Environment Variables for Production**

Ensure you set these environment variables:

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-production-openai-key"
```

### **Deploy to Vercel (Frontend)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### **Deploy to Railway/Heroku (Backend)**

```bash
# Build the application
cd backend
npm run build

# Deploy using your preferred platform
```

### **Docker Deployment**

```bash
# Build production image
docker build -t clientsync .

# Run production container
docker run -p 3000:3000 -p 3001:3001 clientsync
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Code Style**

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing advanced AI capabilities
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: support@clientsync.com
- 💬 **Discord**: [Join our community](https://discord.gg/clientsync)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/clientsync/issues)
- 📖 **Documentation**: [docs.clientsync.com](https://docs.clientsync.com)

---

<div align="center">
  <p>Made with ❤️ by the ClientSync team</p>
  <p>⭐ Star us on GitHub if you find this project helpful!</p>
</div>

