# E2E Testing with Playwright & Firebase Emulators

This directory contains end-to-end tests for the ReadingConnect application using Playwright and Firebase Emulators.

## Architecture

```
e2e/
├── setup/
│   ├── global-setup.ts       # Starts Firebase emulators before tests
│   └── global-teardown.ts    # Stops Firebase emulators after tests
├── utils/
│   ├── firebase.ts           # Firebase emulator connection utilities
│   └── test-helpers.ts       # Test helper functions
├── tests/
│   ├── activities/           # Phase 3: Activity Cloud Functions tests
│   ├── badges/              # Phase 4: Achievement System tests
│   └── teachers/            # Phase 5: Teacher Tools tests
└── README.md
```

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Playwright browsers** installed:
   ```bash
   npx playwright install
   ```

3. **Firebase emulators** downloaded:
   ```bash
   firebase setup:emulators
   ```

## Configuration

### Firebase Emulators

Emulators are configured in `../../firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Playwright Configuration

See `../playwright.config.ts` for test configuration including:
- Browser configurations (Chromium, Firefox, WebKit)
- Mobile viewports
- Test timeouts and retries
- Global setup/teardown hooks

## Running Tests

### Start Emulators Manually (for development)

```bash
npm run emulators:start
```

Access the Emulator UI at: http://localhost:4000

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests with UI Mode

```bash
npm run test:e2e:ui
```

### Run Specific Test Suites

```bash
# Phase 3: Activity tests
npm run test:e2e:activities

# Phase 4: Badge/Achievement tests
npm run test:e2e:badges

# Phase 5: Teacher tools tests
npm run test:e2e:teachers
```

### Debug Mode

```bash
npm run test:e2e:debug
```

## Test Structure

### Activity Tests (Phase 3)

- `phonics.spec.ts` - Tests phonics answer processing and mastery tracking
- `sight-words.spec.ts` - Tests sight word mastery and badge awarding
- `fluency.spec.ts` - Tests fluency session processing and WPM calculation
- `comprehension.spec.ts` - Tests comprehension answer processing and passage completion

### Badge Tests (Phase 4)

- `achievements.spec.ts` - Tests badge awarding, progress tracking, and streak calculation

### Teacher Tests (Phase 5)

- `teacher-tools.spec.ts` - Tests student management, progress viewing, and observations

## Test Data

Test users are defined in `utils/test-helpers.ts`:

```typescript
TEST_USERS = {
  student: { email: 'test.student@example.com', password: 'TestPassword123!' },
  teacher: { email: 'test.teacher@example.com', password: 'TestPassword123!' },
  parent: { email: 'test.parent@example.com', password: 'TestPassword123!' }
}
```

## Writing New Tests

1. Create test file in appropriate directory under `tests/`
2. Import helpers: `import { test, expect } from '@playwright/test'`
3. Use `loginUser()` helper for authentication
4. Use `waitForCloudFunctionResponse()` for async operations
5. Add `data-testid` attributes to UI components for reliable selectors

Example:

```typescript
import { test, expect } from '@playwright/test';
import { loginUser, TEST_USERS } from '../../utils/test-helpers';

test('should do something', async ({ page }) => {
  await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
  await page.goto('/some-page');
  await page.click('[data-testid="some-button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

## Continuous Integration

Tests are configured to:
- Run in parallel locally
- Run sequentially on CI (`workers: 1`)
- Retry failed tests on CI (`retries: 2`)
- Take screenshots on failure
- Record traces for debugging

## Troubleshooting

### Emulators won't start

Check if ports are already in use:
```bash
lsof -i :9099  # Auth
lsof -i :8080  # Firestore
lsof -i :5001  # Functions
```

### Tests timeout waiting for Cloud Functions

Increase timeout in `waitForCloudFunctionResponse()`:
```typescript
await waitForCloudFunctionResponse(page, 20000); // 20 seconds
```

### Firebase connection errors

Ensure emulators are running and check `utils/firebase.ts` emulator URLs match your `firebase.json` configuration.

## Best Practices

1. **Use data-testid attributes** instead of CSS selectors for reliable tests
2. **Keep tests independent** - each test should set up its own state
3. **Use beforeEach for login** - most tests need authenticated users
4. **Wait for Cloud Functions** - always wait for async backend operations
5. **Clean up test data** - use afterEach to reset state if needed
