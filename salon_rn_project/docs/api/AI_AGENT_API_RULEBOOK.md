# AI Agent API Rulebook

## Overview

This rulebook provides comprehensive guidelines and rules for AI agents working on the Salon Management System API implementation. All AI agents must follow these rules to ensure consistency, quality, and maintainability across all sessions.

## Core Principles

### 1. Repository Pattern Adherence
- **MUST** follow the repository pattern strictly
- **MUST** separate data access (repositories) from business logic (services) from request handling (controllers)
- **MUST** use interfaces for all repositories, services, and controllers
- **MUST** implement base classes for common functionality
- **MUST NOT** mix concerns between layers

### 2. TypeScript Type Safety
- **MUST** use TypeScript for all code
- **MUST** define interfaces for all data structures
- **MUST** use strict TypeScript configuration
- **MUST** avoid `any` types unless absolutely necessary
- **MUST** provide proper type definitions for all functions

### 3. Code Quality Standards
- **MUST** follow SOLID principles
- **MUST** keep functions small and focused (single responsibility)
- **MUST** use meaningful variable and function names
- **MUST** add comments only when the "why" is non-obvious
- **MUST** follow DRY (Don't Repeat Yourself) principle

### 4. Testing Requirements
- **MUST** write unit tests for all repositories, services, and controllers
- **MUST** achieve 80%+ test coverage
- **MUST** mock external dependencies in tests
- **MUST** test both success and error scenarios
- **MUST** keep tests fast and isolated

### 5. Error Handling
- **MUST** use custom exception classes
- **MUST** handle errors gracefully
- **MUST** provide meaningful error messages
- **MUST** log errors with context
- **MUST** never expose sensitive information in error messages

## File Structure Rules

### Directory Structure
```
API/
├── src/
│   ├── config/           # Configuration files only
│   ├── core/             # Core abstractions and base classes
│   ├── repositories/     # Data access layer only
│   ├── services/         # Business logic layer only
│   ├── controllers/      # Request handling layer only
│   ├── middleware/       # Cross-cutting concerns only
│   ├── validators/       # Input validation only
│   ├── dto/              # Data transfer objects only
│   ├── constants/        # Constants and enums only
│   ├── exceptions/       # Custom exceptions only
│   └── utils/            # Utility functions only
├── tests/                # Test files only
└── docs/                 # Documentation only
```

### File Naming Conventions
- **Interfaces**: `I{EntityName}.ts` (e.g., `IBookingRepository.ts`)
- **Implementations**: `{EntityName}Repository.ts` (e.g., `BookingRepository.ts`)
- **DTOs**: `{entity}.dto.ts` (e.g., `booking.dto.ts`)
- **Types**: `{category}.types.ts` (e.g., `common.types.ts`)
- **Utils**: `{functionality}.util.ts` (e.g., `logger.util.ts`)
- **Constants**: `{category}.constants.ts` (e.g., `error.constants.ts`)
- **Exceptions**: `{ExceptionName}.ts` (e.g., `NotFoundException.ts`)

### File Organization Rules
- **MUST** keep one class/interface per file
- **MUST** name the file after the main export
- **MUST** place related files in the same directory
- **MUST** use barrel files (index.ts) for clean imports
- **MUST NOT** mix different concerns in the same file

## Code Style Rules

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Import Order
```typescript
// 1. Node.js built-ins
import { promises as fs } from 'fs';
import path from 'path';

// 2. External dependencies
import { z } from 'zod';
import _ from 'lodash';

// 3. Internal modules
import { BaseRepository } from './base/BaseRepository';
import { IBookingRepository } from './interfaces/IBookingRepository';

// 4. Types
import type { Booking } from '../types/common.types';

// 5. Relative imports
import { logger } from '../utils/logger.util';
```

### Function Structure
```typescript
/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws {ExceptionType} When condition is not met
 */
async function functionName(paramName: ParamType): Promise<ReturnType> {
  // Implementation
}
```

### Class Structure
```typescript
/**
 * Brief description of the class.
 */
export class ClassName implements InterfaceName {
  // 1. Public properties
  publicProperty: string;

  // 2. Private properties
  private _dependency: DependencyType;

  // 3. Constructor
  constructor(dependency: DependencyType) {
    this._dependency = dependency;
  }

  // 4. Public methods
  public async methodName(): Promise<ReturnType> {
    // Implementation
  }

  // 5. Private methods
  private async _helperMethod(): Promise<void> {
    // Implementation
  }
}
```

## Repository Pattern Rules

### Interface Definition
```typescript
/**
 * Repository interface for {Entity} entity.
 */
export interface I{Entity}Repository extends IRepository<{Entity}> {
  // Entity-specific methods
  findBy{Criteria}(criteria: CriteriaType): Promise<{Entity}[]>;
  exists{Condition}(condition: ConditionType): Promise<boolean>;
}
```

### Implementation Rules
- **MUST** implement all interface methods
- **MUST** use dependency injection for dependencies
- **MUST** handle database errors appropriately
- **MUST** implement caching where appropriate
- **MUST** log all database operations
- **MUST NOT** include business logic

### Repository Method Rules
- **MUST** return typed promises
- **MUST** throw appropriate exceptions
- **MUST** validate inputs
- **MUST** handle null/undefined cases
- **MUST** use proper error messages

## Service Layer Rules

### Interface Definition
```typescript
/**
 * Service interface for {Entity} business logic.
 */
export interface I{Entity}Service extends IService<{Entity}, CreateDto, UpdateDto> {
  // Business logic methods
  performBusinessAction(input: InputType): Promise<ResultType>;
}
```

### Implementation Rules
- **MUST** implement all interface methods
- **MUST** use repositories for data access
- **MUST** implement business logic validation
- **MUST** handle transactions for complex operations
- **MUST** coordinate multiple repositories
- **MUST NOT** access database directly

### Service Method Rules
- **MUST** validate business rules
- **MUST** check permissions
- **MUST** handle edge cases
- **MUST** provide meaningful error messages
- **MUST** log important operations

## Controller Layer Rules

### Interface Definition
```typescript
/**
 * Controller interface for {Entity} endpoints.
 */
export interface I{Entity}Controller extends IController<{Entity}, CreateDto, UpdateDto> {
  // Endpoint-specific methods
  handleCustomAction(req: Request, res: Response): Promise<void>;
}
```

### Implementation Rules
- **MUST** implement all interface methods
- **MUST** use services for business logic
- **MUST** validate requests before processing
- **MUST** format responses consistently
- **MUST** handle errors gracefully
- **MUST NOT** include business logic

### Controller Method Rules
- **MUST** validate request parameters
- **MUST** call appropriate service methods
- **MUST** format response according to API standards
- **MUST** handle service errors
- **MUST** return appropriate HTTP status codes

## DTO Rules

### Request DTO Rules
- **MUST** use Zod for validation
- **MUST** define all required fields
- **MUST** define all optional fields
- **MUST** provide validation rules
- **MUST** include transformation logic

### Response DTO Rules
- **MUST** match API response format
- **MUST** include all necessary fields
- **MUST** exclude sensitive data
- **MUST** use proper types
- **MUST** be serializable

### DTO Example
```typescript
import { z } from 'zod';

export const createBookingSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  customerId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
```

## Middleware Rules

### Middleware Structure
```typescript
/**
 * {MiddlewareName} middleware.
 */
export const {middlewareName} = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Middleware logic
    next();
  } catch (error) {
    // Error handling
    next(error);
  }
};
```

### Middleware Rules
- **MUST** handle errors appropriately
- **MUST** call next() or send response
- **MUST** not block indefinitely
- **MUST** be composable
- **MUST** be testable

## Exception Rules

### Exception Hierarchy
```typescript
export class BaseException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends BaseException {
  constructor(resource: string, id: string) {
    super('NOT_FOUND_001', `${resource} with id ${id} not found`);
  }
}
```

### Exception Rules
- **MUST** extend BaseException
- **MUST** provide error codes
- **MUST** provide meaningful messages
- **MUST** include relevant details
- **MUST** be serializable

## Testing Rules

### Test Structure
```typescript
describe('{ClassName}', () => {
  let instance: ClassName;

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('{methodName}', () => {
    it('should {expected behavior}', async () => {
      // Test
    });

    it('should throw {Exception} when {condition}', async () => {
      // Test
    });
  });
});
```

### Test Rules
- **MUST** test all public methods
- **MUST** test success scenarios
- **MUST** test error scenarios
- **MUST** mock external dependencies
- **MUST** clean up after each test
- **MUST** keep tests independent

### Test Naming
- **MUST** use descriptive test names
- **MUST** follow "should {expected behavior}" format
- **MUST** include the condition in error tests
- **MUST** be specific about what is being tested

## Documentation Rules

### File Documentation
```typescript
/**
 * {File Purpose}
 *
 * @description {Detailed description}
 * @author {AI Agent}
 * @created {Date}
 * @module {Module Name}
 */
```

### Function Documentation
```typescript
/**
 * {Brief description}
 *
 * @param {paramName} - {Description}
 * @returns {Description}
 * @throws {ExceptionType} - {When thrown}
 * @example
 * ```typescript
 * const result = await functionName(param);
 * ```
 */
```

### Documentation Rules
- **MUST** document all public APIs
- **MUST** include parameter descriptions
- **MUST** include return value descriptions
- **MUST** document thrown exceptions
- **MUST** provide usage examples for complex functions

## Git Commit Rules

### Commit Message Format
```
phase-7-task-#N: {description}

{Detailed description of changes}

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### Commit Rules
- **MUST** use the format `phase-7-task-#N: description`
- **MUST** include task number in commit message
- **MUST** provide meaningful descriptions
- **MUST** commit related changes together
- **MUST** update tracker after each commit

## Performance Rules

### Caching Rules
- **MUST** cache frequently accessed data
- **MUST** use appropriate cache TTL
- **MUST** invalidate cache on updates
- **MUST** handle cache misses gracefully
- **MUST** not cache sensitive data

### Query Optimization Rules
- **MUST** use indexes where appropriate
- **MUST** avoid N+1 queries
- **MUST** use pagination for large datasets
- **MUST** select only needed fields
- **MUST** optimize complex queries

## Security Rules

### Input Validation
- **MUST** validate all inputs
- **MUST** sanitize user input
- **MUST** prevent SQL injection
- **MUST** prevent XSS attacks
- **MUST** use parameterized queries

### Data Protection
- **MUST** encrypt sensitive data
- **MUST** not log sensitive information
- **MUST** use secure transmission
- **MUST** implement proper authentication
- **MUST** implement proper authorization

## Common Pitfalls to Avoid

### DO NOT
- ❌ Mix concerns between layers
- ❌ Use `any` types
- ❌ Skip error handling
- ❌ Write code without tests
- ❌ Commit without updating tracker
- ❌ Ignore TypeScript errors
- ❌ Hardcode values
- ❌ Duplicate code
- ❌ Write overly complex functions
- ❌ Skip documentation

### DO
- ✅ Follow the repository pattern
- ✅ Use proper TypeScript types
- ✅ Handle all errors
- ✅ Write comprehensive tests
- ✅ Update tracker after each task
- ✅ Fix all TypeScript errors
- ✅ Use constants and configuration
- ✅ Follow DRY principle
- ✅ Keep functions focused
- ✅ Document complex logic

## Session Continuation Rules

### When Resuming Work
1. **MUST** read the implementation tracker
2. **MUST** check the current task status
3. **MUST** review the last commit
4. **MUST** understand the context
5. **MUST** continue from where left off

### When Starting New Task
1. **MUST** update tracker to "in_progress"
2. **MUST** understand task requirements
3. **MUST** plan the implementation
4. **MUST** implement the task
5. **MUST** test the implementation
6. **MUST** commit the changes
7. **MUST** update tracker to "completed"

### When Encountering Issues
1. **MUST** document the issue
2. **MUST** propose solutions
3. **MUST** get approval if needed
4. **MUST** implement the solution
5. **MUST** test thoroughly
6. **MUST** document the resolution

## Quality Gates

### Before Committing
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] ESLint passing
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tracker updated

### Before Marking Task Complete
- [ ] All requirements met
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Tracker updated
- [ ] Commit made

## Communication Rules

### When Asking Questions
- **MUST** provide context
- **MUST** be specific about the issue
- **MUST** include relevant code snippets
- **MUST** propose potential solutions
- **MUST** wait for approval before proceeding

### When Reporting Progress
- **MUST** update tracker
- **MUST** commit changes
- **MUST** summarize what was done
- **MUST** note any issues encountered
- **MUST** indicate next steps

## Enforcement

### Violation Consequences
- First violation: Warning and correction
- Second violation: Stop and review
- Third violation: Escalate to human review

### Quality Standards
- **MUST** maintain 80%+ test coverage
- **MUST** keep TypeScript compilation successful
- **MUST** keep all tests passing
- **MUST** follow all style guidelines
- **MUST** maintain documentation

## Version Control

### Branch Rules
- **MUST** work on `phase-7-api-implementation` branch
- **MUST** not commit to main branch
- **MUST** pull latest changes before starting
- **MUST** push changes regularly
- **MUST** create pull requests when complete

### Merge Rules
- **MUST** get approval before merging
- **MUST** ensure all tests pass
- **MUST** resolve all conflicts
- **MUST** update documentation
- **MUST** create merge commit

## Final Notes

### Success Criteria
- ✅ All 15 tasks completed
- ✅ Repository pattern implemented correctly
- ✅ Full TypeScript type safety
- ✅ 80%+ test coverage
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Integration working
- ✅ Performance optimized

### Completion Checklist
- [ ] All tasks completed
- [ ] All tests passing
- [ ] Test coverage > 80%
- [ ] TypeScript compilation successful
- [ ] ESLint passing
- [ ] Documentation complete
- [ ] Integration tested
- [ ] Performance optimized
- [ ] Ready for code review
- [ ] Ready for QA testing

---

**Last Updated**: 2026-05-11
**Version**: 1.0
**Status**: Active

**Remember**: These rules are in place to ensure quality, consistency, and maintainability. Follow them diligently and the API implementation will be successful.
