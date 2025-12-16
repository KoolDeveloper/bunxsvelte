# 02: CRUD Foundations with Drizzle ORM

**Welcome to Module 2!** Here you'll build a complete CRUD (Create, Read, Update, Delete) application using SvelteKit and Drizzle ORM.

## 🎯 Learning Objectives

By the end of this module, you'll be able to:
- Set up a database with Drizzle ORM and SQLite
- Create database schemas
- Implement CRUD operations
- Build forms with validation
- Style your application with Tailwind CSS

## 🚀 Step 1: Set Up Database with Drizzle ORM

### 1.1 Install Database Dependencies

```bash
bun add drizzle-orm better-sqlite3
bun add -d drizzle-kit @types/better-sqlite3
```

### 1.2 Configure Drizzle

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

### 1.3 Create Database Connection

Create `src/lib/server/db.ts`:

```typescript
// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./database.sqlite');
export const db = drizzle(sqlite, { schema });
```

### 1.4 Define Your Schema

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

### 1.5 Create Database Tables

```bash
bun drizzle-kit push:sqlite
```

This creates your `database.sqlite` file with the `todos` table.

## 📝 Step 2: Create the Todo List Page

### 2.1 Create the Page Component

Create `src/routes/todos/+page.svelte`:

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  export let data: PageData;
</script>

<svelte:head>
  <title>Todo List</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-md">
  <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
    Todo List
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

  <!-- Error Display -->
  {#if $page.form?.error}
    <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
      Error: {$page.form.error}
    </div>
  {/if}

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

## 🔧 Step 3: Implement Server-Side Logic

### 3.1 Create the Server File

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

// Define CRUD actions
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

    if (text.length > 200) {
      return { 
        error: 'Todo is too long (max 200 characters)',
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

## 🧪 Step 4: Test Your CRUD Application

### 4.1 Start the development server

```bash
bun dev
```

### 4.2 Test the CRUD operations

1. **Create**: Add new todos using the input field
2. **Read**: See your todos listed below
3. **Update**: Click on a todo to toggle completion
4. **Delete**: Click the ✕ button to remove a todo

### 4.3 Verify error handling

- Try adding an empty todo (should show error)
- Try adding a very long todo (should show error)

## 🎨 Step 5: Add Navigation

Let's add a navigation link to access our todo list:

### 5.1 Update the layout

Edit `src/routes/+layout.svelte`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
</script>

<nav class="bg-blue-600 text-white p-4">
  <div class="container mx-auto flex justify-between items-center">
    <a href="/" class="text-xl font-bold">SvelteKit CRUD</a>
    <div class="space-x-4">
      <a href="/" class="hover:underline">Home</a>
      <a href="/todos" class="hover:underline">Todos</a>
    </div>
  </div>
</nav>

<main class="container mx-auto p-4">
  <slot />
</main>
```

### 5.2 Update the home page

Edit `src/routes/+page.svelte`:

```svelte
<!-- src/routes/+page.svelte -->
<h1 class="text-3xl font-bold mb-4">Welcome to SvelteKit CRUD Tutorial</h1>

<div class="bg-white p-6 rounded-lg shadow-md max-w-md">
  <p class="mb-4">
    This is a complete CRUD (Create, Read, Update, Delete) application built with:
  </p>
  
  <ul class="list-disc pl-5 mb-4 space-y-1">
    <li>SvelteKit for the framework</li>
    <li>Drizzle ORM for database operations</li>
    <li>SQLite for the database</li>
    <li>Tailwind CSS for styling</li>
  </ul>
  
  <p class="mb-4">
    Get started by visiting the <a href="/todos" class="text-blue-600 hover:underline">Todo List</a>.
  </p>
</div>
```

## 🔧 Step 6: Add Basic Testing

Let's add some tests for our CRUD operations:

### 6.1 Install additional testing dependencies

```bash
bun add -d @testing-library/user-event
```

### 6.2 Create database tests

Create `src/lib/server/db.test.ts`:

```typescript
// src/lib/server/db.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

describe('Database CRUD Operations', () => {
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

### 6.3 Create component tests

Create `src/routes/todos/+page.test.ts`:

```typescript
// src/routes/todos/+page.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';
import { describe, it, expect } from 'vitest';

describe('Todo Page', () => {
  const mockData = {
    todos: [
      { id: 1, text: 'Learn SvelteKit', completed: false },
      { id: 2, text: 'Build CRUD app', completed: true }
    ]
  };

  it('should render empty state when no todos', () => {
    render(Page, { props: { data: { todos: [] } } });
    expect(screen.getByText('Your todo list is empty')).toBeInTheDocument();
  });

  it('should render todos', () => {
    render(Page, { props: { data: mockData } });
    expect(screen.getByText('Learn SvelteKit')).toBeInTheDocument();
    expect(screen.getByText('Build CRUD app')).toBeInTheDocument();
  });

  it('should show completed todos with line-through', () => {
    render(Page, { props: { data: mockData } });
    const completedTodo = screen.getByText('Build CRUD app');
    expect(completedTodo).toHaveClass('line-through');
  });
});
```

### 6.4 Run your tests

```bash
bun run test
```

## 🎉 Module 2 Complete!

You've successfully built a complete CRUD application with:
- ✅ Database setup with Drizzle ORM
- ✅ Create, Read, Update, Delete operations
- ✅ Form validation and error handling
- ✅ Tailwind CSS styling
- ✅ Basic testing

**Next Steps:**
- Proceed to [Module 3: Testing](../03-Testing/README.md) to learn comprehensive testing
- Experiment with adding more features to your todo app
- Try implementing user authentication
- Explore adding more complex data relationships

> "The only way to do great work is to love what you do." - Steve Jobs

You're doing great work! Keep building!