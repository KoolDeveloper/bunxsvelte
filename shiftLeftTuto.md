# Shift Left Testing Tutorial for SvelteKit Applications

**Welcome to the Shift Left Testing tutorial!** This guide will teach you how to implement a "shift left" testing approach in your SvelteKit projects. Shift left testing means moving testing earlier in the development process, catching bugs sooner, and improving code quality.

---

## 🎯 What is Shift Left Testing?

Shift left testing is a development approach where testing is integrated early and continuously throughout the development lifecycle, rather than being an afterthought. The goal is to:

- **Catch bugs earlier** when they're cheaper to fix
- **Improve code quality** through immediate feedback
- **Reduce technical debt** by preventing bugs from reaching production
- **Increase developer confidence** in making changes

---

## 🚀 Step 1: Setting Up Your Testing Environment

### 1.1 Install Required Testing Tools

```bash
# Install Vitest for unit testing
bun add -d vitest @vitest/ui jsdom @testing-library/svelte

# Install Playwright for E2E testing
bun add -d @playwright/test

# Install testing utilities
bun add -d @testing-library/jest-dom
```

### 1.2 Configure Vitest

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
    // Watch mode for development
    watch: {
      enabled: true,
      include: ['src/**/*.{test,spec}.{js,ts}']
    }
  }
});
```

Create `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

### 1.3 Add Test Scripts to package.json

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest watch",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage",
    "test": "bun run test:unit && bun run test:e2e"
  }
}
```

---

## 🔧 Step 2: Implementing Test-Driven Development (TDD)

Test-Driven Development is a core shift left practice where you write tests before writing the actual code.

### 2.1 TDD Workflow

1. **Red**: Write a failing test for the feature you want
2. **Green**: Write the minimal code to make the test pass
3. **Refactor**: Improve your code while keeping tests passing

### 2.2 Example: TDD for a Todo Component

Let's create a todo component using TDD:

#### Step 1: Write the failing test

Create `src/lib/components/TodoItem.test.ts`:

```typescript
// src/lib/components/TodoItem.test.ts
import { render, screen } from '@testing-library/svelte';
import TodoItem from './TodoItem.svelte';
import { describe, it, expect } from 'vitest';

describe('TodoItem', () => {
  const mockTodo = {
    id: 1,
    text: 'Learn shift left testing',
    completed: false
  };

  it('should render todo text', () => {
    render(TodoItem, { props: { todo: mockTodo } });
    expect(screen.getByText('Learn shift left testing')).toBeInTheDocument();
  });

  it('should show completed styling when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(TodoItem, { props: { todo: completedTodo } });
    
    const todoElement = screen.getByText('Learn shift left testing');
    expect(todoElement).toHaveClass('line-through');
  });
});
```

Run the test (it should fail):
```bash
bun run test:unit
```

#### Step 2: Create the minimal component

Create `src/lib/components/TodoItem.svelte`:

```svelte
<!-- src/lib/components/TodoItem.svelte -->
<script lang="ts">
  export let todo;
</script>

<div class="flex items-center p-2 {todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}">
  {todo.text}
</div>
```

Run the test again (it should pass now):
```bash
bun run test:unit
```

#### Step 3: Refactor and add more features

Now you can safely add more functionality knowing your tests will catch regressions.

---

## 🧪 Step 3: Unit Testing Strategies

### 3.1 Testing Components

**Best practices for component testing:**

```typescript
// Example: Testing a form component
import { render, screen, fireEvent } from '@testing-library/svelte';
import AddTodoForm from './AddTodoForm.svelte';

describe('AddTodoForm', () => {
  it('should call onSubmit when form is submitted', async () => {
    const mockSubmit = vi.fn();
    render(AddTodoForm, { props: { onSubmit: mockSubmit } });
    
    const input = screen.getByPlaceholderText('Add a new todo');
    await fireEvent.input(input, { target: { value: 'New todo' } });
    
    const button = screen.getByText('Add');
    await fireEvent.click(button);
    
    expect(mockSubmit).toHaveBeenCalledWith('New todo');
  });

  it('should not submit empty todos', async () => {
    const mockSubmit = vi.fn();
    render(AddTodoForm, { props: { onSubmit: mockSubmit } });
    
    const button = screen.getByText('Add');
    await fireEvent.click(button);
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### 3.2 Testing Stores

```typescript
// Example: Testing a Svelte store
import { describe, it, expect, beforeEach } from 'vitest';
import { todoStore } from '$lib/stores/todoStore';

describe('todoStore', () => {
  beforeEach(() => {
    todoStore.reset(); // Clean state before each test
  });

  it('should initialize with empty array', () => {
    const { subscribe } = todoStore;
    let todos;
    subscribe((value) => { todos = value; })();
    
    expect(todos).toEqual([]);
  });

  it('should add todos', () => {
    todoStore.addTodo('Learn testing');
    
    const { subscribe } = todoStore;
    let todos;
    subscribe((value) => { todos = value; })();
    
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe('Learn testing');
  });
});
```

### 3.3 Testing Utilities

```typescript
// Example: Testing utility functions
import { describe, it, expect } from 'vitest';
import { formatDate, validateTodo } from '$lib/utils/helpers';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2023');
    });
  });

  describe('validateTodo', () => {
    it('should return true for valid todo text', () => {
      expect(validateTodo('Valid todo text')).toBe(true);
    });

    it('should return false for empty text', () => {
      expect(validateTodo('')).toBe(false);
    });

    it('should return false for too long text', () => {
      const longText = 'a'.repeat(201);
      expect(validateTodo(longText)).toBe(false);
    });
  });
});
```

---

## 🔍 Step 4: Integration Testing

Integration tests verify that different parts of your application work together correctly.

### 4.1 Testing API Endpoints

```typescript
// Example: Testing server endpoints
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';

describe('Todo API Integration', () => {
  beforeAll(async () => {
    // Setup test data
    await db.insert(todosTable).values({ text: 'Test todo' });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(todosTable);
  });

  it('should create and retrieve todos', async () => {
    // Test the full flow
    const todos = await db.query.todosTable.findMany();
    expect(todos.length).toBeGreaterThan(0);
    expect(todos[0].text).toBe('Test todo');
  });
});
```

### 4.2 Testing Database Operations

```typescript
// Example: Testing database operations
import { describe, it, expect } from 'vitest';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

describe('Database Operations', () => {
  it('should perform CRUD operations', async () => {
    // Create
    const [created] = await db.insert(todosTable)
      .values({ text: 'Integration test' })
      .returning();
    
    expect(created.text).toBe('Integration test');
    
    // Read
    const found = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, created.id)
    });
    expect(found?.text).toBe('Integration test');
    
    // Update
    await db.update(todosTable)
      .set({ completed: true })
      .where(eq(todosTable.id, created.id));
    
    const updated = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, created.id)
    });
    expect(updated?.completed).toBe(true);
    
    // Delete
    await db.delete(todosTable)
      .where(eq(todosTable.id, created.id));
    
    const deleted = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, created.id)
    });
    expect(deleted).toBeUndefined();
  });
});
```

---

## 🌐 Step 5: End-to-End Testing with Playwright

E2E tests verify the complete user experience.

### 5.1 Setting Up Playwright

Initialize Playwright:
```bash
bunx playwright install
```

### 5.2 Writing E2E Tests

Create `tests/todo-flow.spec.ts`:

```typescript
// tests/todo-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
  });

  test('complete todo workflow', async ({ page }) => {
    // 1. Start with empty state
    await expect(page.getByText('Your todo list is empty')).toBeVisible();
    
    // 2. Add a todo
    const todoText = 'Learn shift left testing';
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText(todoText)).toBeVisible();
    
    // 3. Complete the todo
    await page.getByText(todoText).click();
    await expect(page.getByText(todoText)).toHaveClass(/line-through/);
    
    // 4. Delete the todo
    await page.getByRole('button', { name: '✕' }).click();
    await expect(page.getByText(todoText)).not.toBeVisible();
    
    // 5. Back to empty state
    await expect(page.getByText('Your todo list is empty')).toBeVisible();
  });

  test('should handle invalid input', async ({ page }) => {
    // Try to add empty todo
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Should show error
    await expect(page.getByText('Todo cannot be empty')).toBeVisible();
    
    // Empty state should still be visible
    await expect(page.getByText('Your todo list is empty')).toBeVisible();
  });
});
```

### 5.3 Running E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run with UI for debugging
bun run test:e2e:ui

# Run specific test file
bunx playwright test tests/todo-flow.spec.ts
```

---

## 📊 Step 6: Test Coverage and Quality

### 6.1 Generating Test Coverage

```bash
bun run test:coverage
```

This will generate a coverage report showing which parts of your code are tested.

### 6.2 Setting Coverage Thresholds

Update your `vite.config.ts`:

```typescript
// vite.config.ts
test: {
  // ... existing config
  coverage: {
    reporter: ['text', 'json', 'html'],
    thresholds: {
      lines: 80,       // 80% line coverage
      functions: 80,   // 80% function coverage
      branches: 80,    // 80% branch coverage
      statements: 80   // 80% statement coverage
    }
  }
}
```

### 6.3 Continuous Testing in Development

Run tests in watch mode during development:

```bash
bun run test:unit:watch
```

This will automatically re-run tests when files change.

---

## 🤖 Step 7: Automating Testing in CI/CD

### 7.1 GitHub Actions Example

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
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          test-results/
          playwright-report/
```

### 7.2 GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test

test:
  stage: test
  image: oven/bun:latest
  
  script:
    - bun install
    - bun run test:unit
    - bun run test:e2e
  
  artifacts:
    when: always
    paths:
      - test-results/
      - playwright-report/
    expire_in: 1 week
```

---

## 🎯 Step 8: Shift Left Testing Best Practices

### 8.1 Testing Pyramid

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

### 8.2 Test Early, Test Often

- **Write tests before code** (TDD approach)
- **Run tests frequently** during development
- **Fix tests immediately** when they fail
- **Update tests** when requirements change

### 8.3 Test Organization

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

### 8.4 Test Naming Conventions

- **Unit tests**: `ComponentName.test.ts` or `ComponentName.spec.ts`
- **Integration tests**: `feature-name.integration.test.ts`
- **E2E tests**: `user-flow.spec.ts`

### 8.5 Test Quality Metrics

- **Coverage**: Aim for 80%+ coverage
- **Reliability**: Tests should be deterministic
- **Speed**: Unit tests should run in milliseconds
- **Isolation**: Tests shouldn't depend on each other

---

## 🚀 Step 9: Advanced Testing Techniques

### 9.1 Mocking External Services

```typescript
// Example: Mocking API calls
import { vi, describe, it, expect } from 'vitest';
import { getTodos } from '$lib/api/todos';

describe('API Service', () => {
  it('should handle API errors gracefully', async () => {
    // Mock the fetch function
    global.fetch = vi.fn(() => 
      Promise.reject(new Error('Network error'))
    );
    
    const result = await getTodos();
    
    expect(result).toEqual([]); // Should return empty array on error
    expect(fetch).toHaveBeenCalled();
  });
});
```

### 9.2 Snapshot Testing

```typescript
// Example: Snapshot testing components
import { render } from '@testing-library/svelte';
import TodoList from './TodoList.svelte';

describe('TodoList', () => {
  it('should match snapshot', () => {
    const mockTodos = [
      { id: 1, text: 'Todo 1', completed: false },
      { id: 2, text: 'Todo 2', completed: true }
    ];
    
    const { container } = render(TodoList, { props: { todos: mockTodos } });
    expect(container).toMatchSnapshot();
  });
});
```

### 9.3 Visual Regression Testing

```typescript
// Example: Visual regression test with Playwright
import { test, expect } from '@playwright/test';

test('should match visual snapshot', async ({ page }) => {
  await page.goto('/todos');
  
  // Add some todos for consistent state
  await page.getByPlaceholder('What needs to be done?').fill('Test todo');
  await page.getByRole('button', { name: 'Add' }).click();
  
  // Compare with saved snapshot
  expect(await page.screenshot()).toMatchSnapshot('todos-page.png');
});
```

---

## 🎉 Congratulations! You've Mastered Shift Left Testing!

You've successfully implemented a comprehensive shift left testing approach for your SvelteKit application. This will significantly improve your code quality and development speed.

**Key achievements:**
- ✅ Set up unit testing with Vitest
- ✅ Implemented TDD workflow
- ✅ Added integration testing
- ✅ Configured E2E testing with Playwright
- ✅ Set up test coverage reporting
- ✅ Automated testing in CI/CD
- ✅ Learned advanced testing techniques

**Benefits you'll see:**
- 🐛 **Fewer bugs** in production
- 🚀 **Faster development** with immediate feedback
- 💪 **More confident refactoring**
- 📈 **Higher code quality**
- 🤝 **Better team collaboration**

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Shift Left Testing](https://en.wikipedia.org/wiki/Shift-left_testing)

---

## 🐛 Troubleshooting

**Problem: Tests are slow?**
- Mock external dependencies
- Use in-memory databases for unit tests
- Avoid real API calls in unit tests

**Problem: Flaky tests?**
- Ensure proper test isolation
- Clean up after each test
- Avoid dependencies between tests

**Problem: Low coverage?**
- Identify untouched code areas
- Write tests for critical paths first
- Gradually increase coverage

**Problem: Tests failing in CI but not locally?**
- Check environment differences
- Ensure consistent test setup
- Add debug logging

---

> "Quality is not an act, it is a habit." - Aristotle

By implementing shift left testing, you're building the habit of quality into your development process. Happy testing! 🧪