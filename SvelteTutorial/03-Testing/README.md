# 03: Comprehensive Testing for SvelteKit

**Welcome to Module 3!** Here you'll learn how to implement comprehensive testing for your SvelteKit application using a shift-left testing approach.

## 🎯 Learning Objectives

By the end of this module, you'll be able to:
- Understand shift-left testing principles
- Set up unit testing with Vitest
- Write effective component tests
- Implement integration testing
- Add end-to-end testing with Playwright
- Set up test coverage and CI/CD automation

## 🚀 Step 1: Understanding Shift Left Testing

### 1.1 What is Shift Left Testing?

Shift left testing means moving testing earlier in the development process:

```
Traditional: Plan → Design → Develop → Test → Deploy
Shift Left:  Plan → Design → [Develop + Test] → Deploy
```

### 1.2 Benefits of Shift Left Testing

- **Catch bugs earlier** when they're cheaper to fix
- **Immediate feedback** during development
- **Higher code quality** from the start
- **More confident refactoring**
- **Faster development cycles**

### 1.3 Testing Pyramid

```
         /\        
        /  \       
       /    \      
      /      \     
     /        \    
    -----------     
   UI/Integration Tests (Fewer)
   
   -----------     
  Service/API Tests
  
   -----------     
  Unit Tests (Most)
```

## 🧪 Step 2: Setting Up Testing Environment

### 2.1 Install Testing Dependencies

```bash
bun add -d vitest @vitest/ui jsdom @testing-library/svelte @testing-library/user-event
```

### 2.2 Configure Vitest

Update your `vite.config.ts`:

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

### 2.3 Create Test Setup File

Create `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

### 2.4 Add Test Scripts

Update your `package.json`:

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest watch",
    "test:unit:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 🧪 Step 3: Unit Testing

### 3.1 Testing Components

Create `src/lib/components/Counter.test.ts` (if not already created):

```typescript
// src/lib/components/Counter.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';
import { describe, it, expect } from 'vitest';

describe('Counter Component', () => {
  it('should render with initial count of 0', () => {
    render(Counter);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should increment count when + button is clicked', async () => {
    render(Counter);
    const incrementButton = screen.getByText('+');
    
    await fireEvent.click(incrementButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should not go below 0', async () => {
    render(Counter);
    const decrementButton = screen.getByText('-');
    
    await fireEvent.click(decrementButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
```

### 3.2 Testing Database Operations

Create `src/lib/server/db.test.ts`:

```typescript
// src/lib/server/db.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

describe('Database Operations', () => {
  let testTodoId: number;

  beforeAll(async () => {
    await db.delete(todosTable);
  });

  afterAll(async () => {
    await db.delete(todosTable);
  });

  it('should create a todo', async () => {
    const [result] = await db.insert(todosTable)
      .values({ text: 'Test todo' })
      .returning();
    
    expect(result.text).toBe('Test todo');
    testTodoId = result.id;
  });

  it('should update a todo', async () => {
    await db.update(todosTable)
      .set({ completed: true })
      .where(eq(todosTable.id, testTodoId));
    
    const updated = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, testTodoId)
    });
    
    expect(updated?.completed).toBe(true);
  });

  it('should delete a todo', async () => {
    await db.delete(todosTable)
      .where(eq(todosTable.id, testTodoId));
    
    const deleted = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, testTodoId)
    });
    
    expect(deleted).toBeUndefined();
  });
});
```

### 3.3 Testing Utility Functions

Create `src/lib/utils/helpers.ts`:

```typescript
// src/lib/utils/helpers.ts
export function validateTodo(text: string): boolean {
  return text.trim().length > 0 && text.trim().length <= 200;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

Create `src/lib/utils/helpers.test.ts`:

```typescript
// src/lib/utils/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { validateTodo, formatDate } from './helpers';

describe('Utility Functions', () => {
  describe('validateTodo', () => {
    it('should return true for valid todo text', () => {
      expect(validateTodo('Valid todo')).toBe(true);
    });

    it('should return false for empty text', () => {
      expect(validateTodo('')).toBe(false);
    });

    it('should return false for too long text', () => {
      expect(validateTodo('a'.repeat(201))).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2023');
    });
  });
});
```

## 🔍 Step 4: Integration Testing

### 4.1 Testing Server Actions

Create `src/routes/todos/+page.server.test.ts`:

```typescript
// src/routes/todos/+page.server.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';

describe('Todo Page Server Actions', () => {
  beforeEach(async () => {
    await db.delete(todosTable);
  });

  it('should create a todo', async () => {
    const formData = new FormData();
    formData.append('text', 'Test todo');
    
    const request = {
      formData: () => Promise.resolve(formData)
    };
    
    const result = await actions.createTodo(request as any);
    expect(result.success).toBe(true);
    
    const todos = await db.query.todosTable.findMany();
    expect(todos.length).toBe(1);
    expect(todos[0].text).toBe('Test todo');
  });

  it('should not create empty todo', async () => {
    const formData = new FormData();
    formData.append('text', '');
    
    const request = {
      formData: () => Promise.resolve(formData)
    };
    
    const result = await actions.createTodo(request as any);
    expect(result.error).toBe('Todo cannot be empty');
    expect(result.status).toBe(400);
  });

  it('should update todo completion', async () => {
    // First create a todo
    const [todo] = await db.insert(todosTable)
      .values({ text: 'Update test' })
      .returning();
    
    const formData = new FormData();
    formData.append('id', todo.id.toString());
    formData.append('completed', 'true');
    
    const request = {
      formData: () => Promise.resolve(formData)
    };
    
    const result = await actions.updateTodo(request as any);
    expect(result.success).toBe(true);
    
    const updated = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, todo.id)
    });
    
    expect(updated?.completed).toBe(true);
  });
});
```

## 🌐 Step 5: End-to-End Testing with Playwright

### 5.1 Install Playwright

```bash
bun add -d @playwright/test
bunx playwright install
```

### 5.2 Create E2E Tests

Create `tests/todos.spec.ts`:

```typescript
// tests/todos.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
  });

  test('should display empty state initially', async ({ page }) => {
    await expect(page.getByText('Your todo list is empty')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const todoText = 'Learn E2E testing';
    
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    await expect(page.getByText(todoText)).toBeVisible();
    await expect(page.getByText('Your todo list is empty')).not.toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    const todoText = 'Complete E2E test';
    
    // Add todo
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Toggle completion
    await page.getByText(todoText).click();
    
    // Verify styling
    await expect(page.getByText(todoText)).toHaveClass(/line-through/);
  });

  test('should delete a todo', async ({ page }) => {
    const todoText = 'Temporary todo';
    
    // Add todo
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Delete todo
    await page.getByRole('button', { name: '✕' }).click();
    
    // Verify deletion
    await expect(page.getByText(todoText)).not.toBeVisible();
  });

  test('should show error for empty todo', async ({ page }) => {
    // Try to add empty todo
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Should show error
    await expect(page.getByText('Todo cannot be empty')).toBeVisible();
  });
});
```

### 5.3 Add E2E Test Scripts

Update your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test": "bun run test:unit && bun run test:e2e"
  }
}
```

### 5.4 Run E2E Tests

```bash
bun run test:e2e
```

## 📊 Step 6: Test Coverage and Quality

### 6.1 Generate Coverage Report

```bash
bun run test:coverage
```

This will create a coverage report in the `coverage` directory. Open `coverage/index.html` in your browser to see detailed coverage information.

### 6.2 Understanding Coverage Metrics

- **Lines**: Percentage of code lines executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of branch conditions tested
- **Statements**: Percentage of statements executed

### 6.3 Improving Coverage

Look for areas with low coverage and add tests:

```bash
# Run coverage and open UI
bun run test:coverage
open coverage/index.html
```

## 🤖 Step 7: Test-Driven Development (TDD)

### 7.1 TDD Workflow

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### 7.2 Example: TDD for a New Feature

Let's add a todo filtering feature using TDD:

#### Step 1: Write failing test

```typescript
// src/lib/utils/filterTodos.test.ts
import { describe, it, expect } from 'vitest';
import { filterTodos } from './filterTodos';

describe('filterTodos', () => {
  const todos = [
    { id: 1, text: 'Complete TDD', completed: false },
    { id: 2, text: 'Learn testing', completed: true },
    { id: 3, text: 'Write tests', completed: false }
  ];

  it('should filter active todos', () => {
    const active = filterTodos(todos, 'active');
    expect(active).toHaveLength(2);
    expect(active.every(todo => !todo.completed)).toBe(true);
  });

  it('should filter completed todos', () => {
    const completed = filterTodos(todos, 'completed');
    expect(completed).toHaveLength(1);
    expect(completed.every(todo => todo.completed)).toBe(true);
  });

  it('should return all todos for "all" filter', () => {
    const all = filterTodos(todos, 'all');
    expect(all).toHaveLength(3);
  });
});
```

#### Step 2: Implement minimal functionality

```typescript
// src/lib/utils/filterTodos.ts
export function filterTodos(todos: any[], filter: string) {
  if (filter === 'active') {
    return todos.filter(todo => !todo.completed);
  }
  if (filter === 'completed') {
    return todos.filter(todo => todo.completed);
  }
  return todos;
}
```

#### Step 3: Refactor and integrate

Now you can safely integrate this into your todo page!

## 🚀 Step 8: Continuous Testing

### 8.1 Watch Mode

Run tests in watch mode during development:

```bash
bun run test:unit:watch
```

### 8.2 Pre-commit Hooks

Install Husky for pre-commit hooks:

```bash
bun add -d husky
bunx husky init
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run unit tests before commit
bun run test:unit

# If tests pass, proceed with commit
# If tests fail, commit is aborted
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

### 8.3 CI/CD Integration

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Bun
      uses: oven-sh/setup-bun@v1
    
    - name: Install dependencies
      run: bun install
    
    - name: Run unit tests
      run: bun run test:unit
    
    - name: Run E2E tests
      run: bun run test:e2e
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: coverage/
```

## 🎯 Step 9: Testing Best Practices

### 9.1 Test Organization

```
src/
  lib/
    components/
      Button.svelte
      Button.test.ts      # Component tests
    utils/
      helpers.ts
      helpers.test.ts     # Utility tests
    server/
      db.ts
      db.test.ts          # Server-side tests
  routes/
    todos/
      +page.svelte
      +page.test.ts       # Page tests
      TodoItem.svelte
      TodoItem.test.ts    # Component tests

tests/
  e2e/
    todo-flow.spec.ts    # End-to-end tests
```

### 9.2 Test Naming

- **Unit tests**: `ComponentName.test.ts`
- **Integration tests**: `feature.integration.test.ts`
- **E2E tests**: `user-flow.spec.ts`

### 9.3 Test Quality

- **Isolation**: Tests shouldn't depend on each other
- **Deterministic**: Same input → same output
- **Fast**: Unit tests should run in milliseconds
- **Clear**: Test names should describe behavior

### 9.4 When to Test

- **Before coding**: TDD approach
- **During development**: Continuous testing
- **Before commit**: Pre-commit hooks
- **Before merge**: CI/CD pipeline
- **Before release**: Full test suite

## 🎉 Module 3 Complete!

You've successfully implemented comprehensive testing for your SvelteKit application:
- ✅ Unit testing with Vitest
- ✅ Integration testing
- ✅ End-to-end testing with Playwright
- ✅ Test coverage and quality metrics
- ✅ Continuous testing workflow
- ✅ CI/CD integration

**Next Steps:**
- Proceed to [Module 4: Advanced Topics](../04-Advanced/README.md)
- Practice TDD with new features
- Improve test coverage
- Experiment with different testing approaches

> "Testing leads to failure, and failure leads to understanding." - Burt Rutan

You now have the tools to build robust, well-tested applications! Keep testing!