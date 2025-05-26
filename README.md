# Vaulta - Self-Hosted Media Management

A fullstack web application for browsing, tagging, and organizing high-resolution images and videos stored locally on disk.

## Features

- Gallery/grid view for images and videos
- Tag and collection management
- Responsive, dark-mode friendly UI
- EXIF metadata extraction
- Local storage with Docker volumes
- Fast thumbnail generation
- Token-protected REST API

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL
- **Image Processing**: Sharp, ExifTool
- **Deployment**: Docker Compose

## Quick Start

### Option 1: Using the Development Script (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd vaulta

# Make the script executable and run setup
chmod +x dev.sh
./dev.sh setup

# Start the application
./dev.sh start
```

### Option 2: Manual Setup

1. **Clone and setup**:

   ```bash
   cd vaulta
   cp .env.example .env
   ```

2. **Start with Docker**:

   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000

## Development

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- VS Code (recommended)

### Development Modes

#### Full Docker Mode

```bash
./dev.sh start
# or
docker-compose up --build
```

#### Local Development Mode (Recommended)

```bash
./dev.sh dev
```

This starts:

- Database in Docker
- Backend locally with hot reload
- Frontend locally with hot reload

#### Manual Local Development

```bash
# Start database only
docker-compose up db -d

# Backend (in separate terminal)
cd backend
npm install
npm run dev

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

### VS Code Integration

This project includes VS Code configuration for an optimal development experience:

#### Quick Actions (Ctrl/Cmd + Shift + P → "Tasks: Run Task")

- **Start Full Stack (Docker)** - Complete Docker setup
- **Start Backend Dev** - Local backend development
- **Start Frontend Dev** - Local frontend development
- **Start Database Only** - Database for local development
- **Stop All Services** - Stop all running services
- **Install Dependencies** - Install backend/frontend deps
- **Build** - Build backend/frontend
- **Clean & Rebuild Docker** - Fresh Docker build
- **View Logs** - View container logs
- **Scan Media Files** - Scan for new media

#### Debugging

- Use F5 to start debugging the backend
- Breakpoints work in TypeScript files
- Two debug configurations available:
  - Debug Backend (requires manual DB start)
  - Debug Backend (with DB) - automatically starts database

#### Recommended Extensions

The project includes extension recommendations that will be suggested when you open the project in VS Code.

#### Project Settings

- `settings.json` - User-specific settings (ignored by git)
- `settings.project.json` - Shared project settings for consistent development experience

### Development Commands

```bash
# Development helper script
./dev.sh help              # Show all available commands
./dev.sh setup             # Initial setup
./dev.sh start             # Start with Docker
./dev.sh dev               # Development mode
./dev.sh stop              # Stop all services
./dev.sh clean             # Clean up everything

# Backend commands
cd backend
npm run dev                # Development server
npm run build              # Build for production
npm run scan               # Scan media files
npm run migrate            # Run database migrations

# Frontend commands
cd frontend
npm run dev                # Development server
npm run build              # Build for production
npm run lint               # Lint code
```

## Project Structure

```
/vaulta
├── .vscode/               # VS Code configuration
│   ├── tasks.json         # Quick action tasks
│   ├── launch.json        # Debug configurations
│   ├── settings.json      # User-specific settings (gitignored)
│   ├── settings.project.json # Shared project settings
│   └── extensions.json    # Recommended extensions
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Fastify API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── config/        # Configuration
│   │   ├── types/         # TypeScript types
│   │   └── scripts/       # Utility scripts
│   ├── sql/
│   │   └── init.sql       # Database schema
│   └── package.json
├── data/
│   ├── originals/         # Original media files
│   ├── thumbs/            # Generated thumbnails
│   └── db/                # PostgreSQL data
├── docker-compose.yml     # Docker services
├── dev.sh                 # Development helper script
├── .env.example           # Environment variables template
└── README.md
```

## API Endpoints

- `GET /api/media` - List all media files
- `GET /api/media/:id` - Get specific media details
- `POST /api/media/:id/tags` - Add tags to media
- `GET /api/tags` - List all tags
- `GET /api/collections` - List all collections

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
# Database Configuration
DATABASE_URL=postgresql://vaulta:vaulta123@localhost:5432/vaulta
POSTGRES_DB=vaulta
POSTGRES_USER=vaulta
POSTGRES_PASSWORD=vaulta123

# Backend Configuration
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Media Storage Paths
MEDIA_ORIGINALS_PATH=./data/originals
MEDIA_THUMBS_PATH=./data/thumbs
```

## Troubleshooting

### Common Issues

1. **Docker not running**: Ensure Docker Desktop is running
2. **Port conflicts**: Check if ports 3000, 8000, or 5432 are in use
3. **Permission issues**: Ensure the `data/` directory is writable
4. **Database connection**: Wait a few seconds for the database to initialize

### Useful Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Reset everything
./dev.sh clean
./dev.sh setup
./dev.sh start

# Access database directly
docker-compose exec db psql -U vaulta -d vaulta
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
