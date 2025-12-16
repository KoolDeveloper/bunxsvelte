# SvelteKit CRUD Tutorial: From Zero to Production

**Welcome to this beginner-friendly SvelteKit tutorial!** This guide will take you from absolute beginner to building a functional CRUD (Create, Read, Update, Delete) application using SvelteKit, Drizzle ORM, and SQLite. By the end, you'll have a production-ready todo application.

**What you'll learn:**
- SvelteKit project structure and routing
- Setting up a database with Drizzle ORM and SQLite
- Building CRUD operations (Create, Read, Update, Delete)
- Form handling and validation
- Production-ready practices

---

## 🚀 Getting Started: Prerequisites

Before we begin, make sure you have:
- [Bun](https://bun.sh/) installed (we'll use it as our package manager and runtime)
- Basic knowledge of HTML, CSS, and JavaScript
- A code editor (VS Code recommended)

If you don't have Bun installed, run:
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 📁 Step 1: Understanding Your SvelteKit Project Structure

Let's explore the key directories in your project:

### `src/routes/` - The Heart of Your Application
This is where your pages live. SvelteKit uses **file-based routing** - the folder structure directly maps to URLs.

**Key files you'll see:**
- `+page.svelte` - The UI for a page
- `+layout.svelte` - Shared layout (like headers/footers)
- `+page.server.ts` - Server-side logic for a page
- `+server.ts` - API endpoints

**Examples:**
- `src/routes/+page.svelte` → Your homepage (`/`)
- `src/routes/about/+page.svelte` → `/about` page
- `src/routes/users/[id]/+page.svelte` → Dynamic route like `/users/123`

### `src/lib/` - Your Toolbox
This is where reusable code lives:
- `components/` - Reusable UI components
- `server/` - Server-side utilities (database, auth, etc.)
- `utils/` - Helper functions
- `stores/` - Svelte stores for state management

### Other Important Files
- `drizzle.config.ts` - Database migration configuration
- `package.json` - Project dependencies
- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.ts` - Tailwind CSS configuration

---

## 🛠️ Step 2: Setting Up the Database

We'll use **Drizzle ORM** with **SQLite** (via better-sqlite3) for our database.

### 2.1 Install Required Packages

Run these commands in your terminal:

```bash
# Install main dependencies
bun add drizzle-orm better-sqlite3

# Install development dependencies
bun add -d drizzle-kit @types/better-sqlite3
```

### 2.2 Configure Drizzle

Create `drizzle.config.ts` in your project root:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: 'file:./database.sqlite',
    driver: 'better-sqlite3',
  },
  dialect: 'sqlite',
});
```

### 2.3 Create Database Connection

Create `src/lib/server/db.ts`:

```typescript
// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize database connection
const sqlite = new Database('./database.sqlite');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });
```

### 2.4 Define Your Database Schema

Create `src/lib/server/schema.ts`:

```typescript
// src/lib/server/schema.ts
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const todosTable = sqliteTable('todos', {
  id: integer('id', { mode: 'number' })
    .primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' })
    .default(false),
  createdAt: integer('created_at', { mode: 'timestamp'})
    .default(sql`CURRENT_TIMESTAMP`),
});
```

### 2.5 Create Your Database Tables

Run this command to create your database:

```bash
bun drizzle-kit push:sqlite
```

This creates a `database.sqlite` file with your `todos` table.

---

## 🎨 Step 3: Building the Todo List UI

Now let's create our todo list interface.

### 3.1 Create the Page Component

Create `src/routes/todos/+page.svelte`:

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  export let data: PageData;
</script>

<svelte:head>
  <title>My Todo List</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-md">
  <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
    My Todo List
  </h1>

  <!-- Add Todo Form -->
  <form
    method="POST"
    action="?/createTodo"
    use:enhance
    class="mb-6 flex space-x-2"
  >
    <input
      type="text"
      name="text"
      required
      placeholder="What needs to be done?"
      class="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Add
    </button>
  </form>

  <!-- Todo List -->
  {#if data.todos && data.todos.length > 0}
    <ul class="space-y-2">
      {#each data.todos as todo (todo.id)}
        <li class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-100">
          <!-- Toggle completion -->
          <form method="POST" action="?/updateTodo" use:enhance class="flex items-center flex-grow">
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="completed" value={todo.completed ? 'false' : 'true'} />
            <button
              type="submit"
              class="flex-grow text-left {todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}"
            >
              {todo.text}
            </button>
          </form>

          <!-- Delete button -->
          <form method="POST" action="?/deleteTodo" use:enhance>
            <input type="hidden" name="id" value={todo.id} />
            <button
              type="submit"
              class="text-red-500 hover:text-red-700 ml-2"
            >
              ✕
            </button>
          </form>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-center text-gray-500 mt-8">
      Your todo list is empty. Add your first todo above!
    </p>
  {/if}
</div>
```

---

## 🔧 Step 4: Adding Server Logic (CRUD Operations)

Now let's add the server-side logic to handle our CRUD operations.

### 4.1 Create the Server File

Create `src/routes/todos/+page.server.ts`:

```typescript
// src/routes/todos/+page.server.ts
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

// Load data when page is visited
export const load: PageServerLoad = async () => {
  const todos = await db.query.todosTable.findMany({
    orderBy: (todos, { asc }) => [asc(todos.createdAt)],
  });
  
  return { todos };
};

// Define our CRUD actions
export const actions: Actions = {
  // CREATE: Add a new todo
  createTodo: async ({ request }) => {
    const formData = await request.formData();
    const text = formData.get('text') as string | null;

    if (!text || text.trim() === '') {
      return { 
        error: 'Todo cannot be empty',
        status: 400 
      };
    }

    try {
      await db.insert(todosTable).values({ 
        text: text.trim() 
      });
      return { success: true };
    } catch (error) {
      console.error('Create error:', error);
      return { 
        error: 'Failed to create todo',
        status: 500 
      };
    }
  },

  // UPDATE: Toggle todo completion
  updateTodo: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    const completed = formData.get('completed') as string | null;

    if (id === null || completed === null) {
      return { 
        error: 'Missing required fields',
        status: 400 
      };
    }

    try {
      const isCompleted = completed === 'true';
      await db.update(todosTable)
        .set({ completed: isCompleted })
        .where(eq(todosTable.id, Number(id)));
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return { 
        error: 'Failed to update todo',
        status: 500 
      };
    }
  },

  // DELETE: Remove a todo
  deleteTodo: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (id === null) {
      return { 
        error: 'Missing todo ID',
        status: 400 
      };
    }

    try {
      await db.delete(todosTable)
        .where(eq(todosTable.id, Number(id)));
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { 
        error: 'Failed to delete todo',
        status: 500 
      };
    }
  }
};
```

---

## 🧪 Step 5: Testing Your Application

Now let's test what we've built!

### 5.1 Start the Development Server

```bash
bun dev
```

### 5.2 Open Your Browser

Visit `http://localhost:5173/todos` (or the port shown in your terminal).

### 5.3 Test the CRUD Operations

1. **Create**: Add a new todo using the input field
2. **Read**: See your todos listed below
3. **Update**: Click on a todo to toggle completion
4. **Delete**: Click the ✕ button to remove a todo

---

## 🎯 Step 6: Production-Ready Enhancements

Let's make our app more robust for production:

### 6.1 Add Error Handling

Update your `+page.svelte` to show errors:

```svelte
{#if $page.form?.error}
  <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
    Error: {$page.form.error}
  </div>
{/if}
```

### 6.2 Add Loading States

```svelte
{#if $page.form?.pending}
  <div class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center">
    <div class="bg-white p-4 rounded-md shadow-lg">
      Loading...
    </div>
  </div>
{/if}
```

### 6.3 Add Input Validation

Update your `createTodo` action:

```typescript
createTodo: async ({ request }) => {
  const formData = await request.formData();
  const text = formData.get('text') as string | null;

  if (!text || text.trim() === '') {
    return { 
      error: 'Todo cannot be empty',
      status: 400 
    };
  }

  if (text.length > 200) {
    return { 
      error: 'Todo is too long (max 200 characters)',
      status: 400 
    };
  }

  // ... rest of the code
}
```

---

## 🚀 Step 7: Deploying to Production

### 7.1 Build Your Application

```bash
bun run build
```

### 7.2 Preview the Production Build

```bash
bun run preview
```

### 7.3 Deployment Options

You can deploy your SvelteKit app to:
- **Vercel**: `bun add -D @sveltejs/adapter-vercel`
- **Netlify**: `bun add -D @sveltejs/adapter-netlify`
- **Node.js server**: `bun add -D @sveltejs/adapter-node`

After adding an adapter, update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

export default {
  kit: {
    adapter: adapter()
  },
  preprocess: vitePreprocess()
};
```

---

## 🧪 Step 8: Testing Your Application (Bonus Section)

Testing ensures your application works correctly and helps prevent bugs. Let's add testing to our todo app!

### 8.1 Install Testing Dependencies

```bash
# Install Vitest and testing utilities
bun add -d vitest @vitest/ui jsdom @testing-library/svelte

# Install Playwright for end-to-end testing
bun add -d @playwright/test
```

### 8.2 Configure Vitest

Create `vite.config.ts` (or update existing):

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
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

Create `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

### 8.3 Unit Testing with Vitest

Create `src/lib/server/db.test.ts` to test our database:

```typescript
// src/lib/server/db.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

describe('Database Operations', () => {
  let testTodoId: number;

  beforeAll(async () => {
    // Clean up before tests
    await db.delete(todosTable);
  });

  afterAll(async () => {
    // Clean up after tests
    await db.delete(todosTable);
  });

  it('should create a todo', async () => {
    const [result] = await db.insert(todosTable)
      .values({ text: 'Test todo' })
      .returning();
    
    expect(result).toBeDefined();
    expect(result.text).toBe('Test todo');
    expect(result.completed).toBe(false);
    
    testTodoId = result.id;
  });

  it('should read todos', async () => {
    const todos = await db.query.todosTable.findMany();
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);
  });

  it('should update a todo', async () => {
    await db.update(todosTable)
      .set({ completed: true })
      .where(eq(todosTable.id, testTodoId));
    
    const updatedTodo = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, testTodoId)
    });
    
    expect(updatedTodo?.completed).toBe(true);
  });

  it('should delete a todo', async () => {
    await db.delete(todosTable)
      .where(eq(todosTable.id, testTodoId));
    
    const deletedTodo = await db.query.todosTable.findFirst({
      where: eq(todosTable.id, testTodoId)
    });
    
    expect(deletedTodo).toBeUndefined();
  });
});
```

### 8.4 Component Testing

Create `src/routes/todos/TodoItem.test.ts`:

```typescript
// src/routes/todos/TodoItem.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import TodoItem from './TodoItem.svelte';
import { describe, it, expect } from 'vitest';

describe('TodoItem Component', () => {
  const mockTodo = {
    id: 1,
    text: 'Test todo item',
    completed: false,
    createdAt: new Date()
  };

  it('renders todo text', () => {
    render(TodoItem, { props: { todo: mockTodo } });
    expect(screen.getByText('Test todo item')).toBeInTheDocument();
  });

  it('shows completed style when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(TodoItem, { props: { todo: completedTodo } });
    
    const todoText = screen.getByText('Test todo item');
    expect(todoText).toHaveClass('line-through');
  });

  it('triggers update when clicked', async () => {
    const mockUpdate = vi.fn();
    render(TodoItem, { 
      props: { 
        todo: mockTodo,
        onUpdate: mockUpdate 
      } 
    });
    
    const todoButton = screen.getByRole('button', { name: 'Test todo item' });
    await fireEvent.click(todoButton);
    
    expect(mockUpdate).toHaveBeenCalledWith(mockTodo.id, true);
  });
});
```

### 8.5 End-to-End Testing with Playwright

Create `tests/todos.spec.ts`:

```typescript
// tests/todos.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
  });

  test('should display empty state initially', async ({ page }) => {
    await expect(page.getByText('Your todo list is empty')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const todoText = 'Buy groceries';
    
    // Fill the input
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    
    // Click add button
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Verify todo appears
    await expect(page.getByText(todoText)).toBeVisible();
    
    // Verify empty state is gone
    await expect(page.getByText('Your todo list is empty')).not.toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    const todoText = 'Complete tutorial';
    
    // Add a todo first
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Click the todo to toggle completion
    const todoItem = page.getByText(todoText);
    await todoItem.click();
    
    // Verify it has completed styling
    await expect(todoItem).toHaveClass(/line-through/);
  });

  test('should delete a todo', async ({ page }) => {
    const todoText = 'Temporary task';
    
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Click delete button
    await page.getByRole('button', { name: '✕' }).first().click();
    
    // Verify todo is removed
    await expect(page.getByText(todoText)).not.toBeVisible();
  });
});
```

### 8.6 Running Your Tests

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test": "bun run test:unit && bun run test:e2e"
  }
}
```

Now you can run:

```bash
# Run unit tests
bun run test:unit

# Run unit tests with UI
bun run test:unit:ui

# Run end-to-end tests
bun run test:e2e

# Run all tests
bun run test
```

### 8.7 Testing Best Practices

1. **Test Pyramid**: Focus on unit tests (most), then integration tests, then E2E tests (fewest)
2. **Isolate Tests**: Each test should be independent
3. **Clear Naming**: Test names should describe what they're testing
4. **Test Edge Cases**: Empty inputs, invalid data, etc.
5. **Mock External Services**: For APIs, databases in unit tests
6. **Continuous Testing**: Run tests frequently during development

---

## 🎉 Congratulations! You've Built a CRUD App!

You've successfully:
- ✅ Set up a SvelteKit project with proper structure
- ✅ Configured a database with Drizzle ORM and SQLite
- ✅ Built a complete CRUD interface
- ✅ Added error handling and validation
- ✅ Implemented comprehensive testing
- ✅ Prepared your app for production

**Next steps to explore:**
- Add user authentication with Lucia or Auth.js
- Implement more complex data relationships (one-to-many, many-to-many)
- Add real-time updates with WebSockets or Server-Sent Events
- Explore Svelte stores for client-side state management
- Add more advanced testing scenarios
- Implement CI/CD pipelines for automated testing and deployment

---

## 📚 Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Bun Documentation](https://bun.sh/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)

---

## 🐛 Troubleshooting

**Problem: Database not connecting?**
- Make sure `database.sqlite` exists in your project root
- Check file permissions
- Verify your schema matches your code

**Problem: Forms not working?**
- Check your form `action` attributes
- Ensure you're using `method="POST"`
- Verify your action names match in both frontend and backend

**Problem: Styles not applying?**
- Make sure Tailwind CSS is properly configured
- Check your `tailwind.config.ts` file
- Verify you have `@tailwind` directives in your CSS

**Problem: Tests failing?**
- Check if your test database is clean before each test
- Verify your test setup matches your production environment
- Add debug logging to see what's happening
- Run tests in UI mode to see the browser interaction

---

**Happy coding!** 🎨 If you get stuck, remember that every developer goes through challenges when learning. Take breaks, ask for help, and keep experimenting!

> "Testing is not about finding bugs, it's about preventing them." - Unknown
