# Development Setup

Complete development environment setup guide for the Salon Management System.

## Table of Contents
1. [IDE Setup](#ide-setup)
2. [Development Tools](#development-tools)
3. [Code Style](#code-style)
4. [Git Workflow](#git-workflow)
5. [Testing Setup](#testing-setup)
6. [Debugging Setup](#debugging-setup)
7. [Local Development](#local-development)

---

## IDE Setup

### Recommended IDEs

#### Visual Studio Code
1. Download and install [VS Code](https://code.visualstudio.com/)
2. Install recommended extensions:
   - ESLint
   - Prettier
   - TypeScript
   - React Native Tools
   - GitLens
   - Error Lens

#### WebStorm
1. Download and install [WebStorm](https://www.jetbrains.com/webstorm/)
2. Configure React Native support
3. Set up TypeScript inspection

### VS Code Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "msjsdiag.vscode-react-native",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/android/build": true,
    "**/ios/build": true
  }
}
```

---

## Development Tools

### React Native Debugger

#### Installation
```bash
npm install -g react-native-debugger
```

#### Usage
1. Start React Native Debugger
2. Start your app with debugging enabled
3. Connect to the debugger

### Reactotron

#### Installation
```bash
npm install --save-dev reactotron-react-native
```

#### Configuration
Create `ReactotronConfig.ts`:

```typescript
import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  const tron = Reactotron.configure()
    .useReactNative()
    .connect();

  console.tron = tron;
}
```

### Flipper

#### Installation
Flipper is included with React Native 0.62+.

#### Usage
1. Start your app
2. Open Flipper from Android Studio
3. Connect to your device/emulator

---

## Code Style

### ESLint Configuration

Located at `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@react-native', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier Configuration

Located at `.prettierrc.js`:

```javascript
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
};
```

### Git Hooks

Install Husky for git hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Create `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

---

## Git Workflow

### Branch Naming Convention

```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
release/version-number
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

#### Examples
```
feat(auth): add biometric authentication

Implement fingerprint and face ID authentication
for improved security and user experience.

Closes #123
```

### Pull Request Process

1. Create a new branch from `master`
2. Make your changes
3. Write tests
4. Update documentation
5. Create a pull request
6. Request review
7. Address feedback
8. Merge to `master`

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## Testing Setup

### Unit Testing

#### Run All Tests
```bash
npm test
```

#### Run Specific Test File
```bash
npm test -- AuthService.test.ts
```

#### Watch Mode
```bash
npm test -- --watch
```

#### Coverage Report
```bash
npm test -- --coverage
```

### Integration Testing

#### Setup
```bash
npm install --save-dev @testing-library/react-native
```

#### Run Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### E2E Testing

#### Setup Detox
```bash
npm install --save-dev detox detox-cli
```

#### Initialize Detox
```bash
npx detox init
```

#### Run E2E Tests
```bash
npm run test:e2e
```

---

## Debugging Setup

### React Native Debugger

#### Start Debugger
```bash
react-native-debugger
```

#### Connect to App
1. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
2. Select "Debug"
3. Open React Native Debugger

### Chrome DevTools

#### Enable Debugging
1. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
2. Select "Debug"
3. Open Chrome DevTools

#### Network Inspection
1. Open Chrome DevTools
2. Go to Network tab
3. Monitor API calls

### Console Logging

#### Debug Logging
```typescript
import { Logger } from '../utils/logger';

Logger.debug('Debug message', data);
Logger.info('Info message', data);
Logger.warn('Warning message', data);
Logger.error('Error message', error);
```

#### Conditional Logging
```typescript
if (__DEV__) {
  console.log('Development only log');
}
```

---

## Local Development

### Start Development Server

#### Metro Bundler
```bash
npm start
```

#### With Cache Reset
```bash
npm start -- --reset-cache
```

### Run on Device

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

### Hot Reloading

#### Enable Hot Reloading
- Shake device or press Cmd+D (iOS) / Cmd+M (Android)
- Select "Enable Fast Refresh"

#### Manual Reload
- Shake device or press Cmd+D (iOS) / Cmd+M (Android)
- Select "Reload"

### Environment Variables

#### Development Environment
```bash
# Create .env.development
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_ENABLE_DEBUG_MODE=true
```

#### Load Environment
```bash
# Restart Metro bundler after changing .env
npm start -- --reset-cache
```

---

## Common Development Tasks

### Adding a New Screen

1. Create screen component
2. Add to navigator
3. Update types
4. Write tests
5. Update documentation

### Adding a New Service

1. Create service file
2. Implement methods
3. Add error handling
4. Write tests
5. Update documentation

### Adding a New Hook

1. Create hook file
2. Implement logic
3. Add TypeScript types
4. Write tests
5. Update documentation

---

## Performance Optimization

### Bundle Size Analysis

```bash
# Analyze bundle size
npx react-native-bundle-visualizer
```

### Performance Profiling

1. Open React Native Debugger
2. Go to Performance tab
3. Record performance
4. Analyze results

### Memory Profiling

1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Analyze memory usage

---

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
npm start -- --reset-cache

# Clear watchman
watchman watch-del-all

# Clear node_modules
rm -rf node_modules
npm install
```

### Build Issues

```bash
# Android
cd android
./gradlew clean
cd ..

# iOS
cd ios
pod deintegrate
pod install
cd ..
```

### Dependency Issues

```bash
# Update dependencies
npm update

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

After development setup:

1. [Review Code Style Guidelines](#code-style)
2. [Set Up Testing](#testing-setup)
3. [Start Development](#local-development)
4. [Review Architecture Documentation](../architecture/ARCHITECTURE.md)

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
