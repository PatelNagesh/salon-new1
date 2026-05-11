# Salon Management System API

Professional-grade API layer for the Salon Management System, built using the Repository Pattern with TypeScript.

## Overview

This API provides a clean, type-safe interface between the React Native frontend and the Supabase backend. It follows the Repository Pattern to separate concerns and improve maintainability.

## Architecture

```
Controllers (Request Handling)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Supabase (Database)
```

## Features

- ✅ Repository Pattern for clean data access
- ✅ Full TypeScript type safety
- ✅ Comprehensive error handling
- ✅ Input validation with Zod
- ✅ Caching support
- ✅ 80%+ test coverage
- ✅ Comprehensive documentation

## Installation

```bash
npm install
```

## Development

```bash
# Watch mode for development
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
API/
├── src/
│   ├── config/           # Configuration files
│   ├── core/             # Base classes and interfaces
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── controllers/      # Request handling layer
│   ├── middleware/       # Cross-cutting concerns
│   ├── validators/       # Input validation
│   ├── dto/              # Data transfer objects
│   ├── constants/        # Constants and enums
│   ├── exceptions/       # Custom exceptions
│   └── utils/            # Utility functions
├── tests/                # Test files
└── docs/                 # Documentation
```

## Usage

```typescript
import { BookingController } from '@controllers/implementations/BookingController';
import { BookingService } from '@services/implementations/BookingService';
import { BookingRepository } from '@repositories/implementations/BookingRepository';

// Create instances
const bookingRepository = new BookingRepository();
const bookingService = new BookingService(bookingRepository);
const bookingController = new BookingController(bookingService);

// Use the controller
const booking = await bookingController.create(createBookingDto);
```

## Documentation

- [API Architecture](docs/API_ARCHITECTURE.md)
- [Implementation Plan](docs/PHASE_7_API_IMPLEMENTATION_PLAN.md)
- [Implementation Tracker](docs/PHASE_7_IMPLEMENTATION_TRACKER.md)
- [AI Agent Rulebook](docs/AI_AGENT_API_RULEBOOK.md)

## Contributing

Please follow the guidelines in the AI Agent Rulebook when contributing to this project.

## License

MIT
