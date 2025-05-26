# Vaulta Development Quick Reference

## Quick Start

```bash
# First time setup
./dev.sh setup

# Start development (recommended)
./dev.sh dev

# Or start with Docker
./dev.sh start
```

## VS Code Quick Actions

Press `Ctrl/Cmd + Shift + P` → "Tasks: Run Task" → Select:

- 🚀 **Start Full Stack (Docker)** - Complete Docker setup
- 🔧 **Start Backend Dev** - Local backend development
- ⚛️ **Start Frontend Dev** - Local frontend development
- 🗄️ **Start Database Only** - Database for local development
- 🛑 **Stop All Services** - Stop all running services

## 🔧 Development Commands

```bash
# Development script
./dev.sh help              # Show all commands
./dev.sh setup             # Initial setup
./dev.sh start             # Docker mode
./dev.sh dev               # Local development mode
./dev.sh stop              # Stop all services
./dev.sh clean             # Clean everything

# NPM shortcuts (from root)
npm run dev                 # Start local development
npm run start               # Start with Docker
npm run stop                # Stop services
npm run build:all           # Build both frontend and backend
npm run lint:all            # Lint both projects
```

## Debugging

- Press `F5` in VS Code to start debugging the backend
- Two debug configurations available:
  - **Debug Backend** - Manual DB start required
  - **Debug Backend (with DB)** - Auto-starts database

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

## Key Directories

- `frontend/src/` - React/Next.js code
- `backend/src/` - Fastify API code
- `data/originals/` - Place your media files here
- `data/thumbs/` - Generated thumbnails
- `.vscode/` - VS Code configuration

## Troubleshooting

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Reset everything
./dev.sh clean && ./dev.sh setup && ./dev.sh start

# Database access
docker-compose exec db psql -U vaulta -d vaulta
```

## Dependencies

- **Node.js 18+** (for local development)
- **Docker & Docker Compose** (required)
- **VS Code** (recommended with extensions)

## Development Workflow

1. **First time**: `./dev.sh setup`
2. **Daily development**: `./dev.sh dev`
3. **Testing**: Add media files to `data/originals/`
4. **Debugging**: Use F5 in VS Code
5. **Building**: `npm run build:all`
