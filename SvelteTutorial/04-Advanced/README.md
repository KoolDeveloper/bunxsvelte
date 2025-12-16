# 04: Advanced SvelteKit Topics

**Welcome to Module 4!** Here you'll explore advanced topics to take your SvelteKit applications to the next level.

## 🎯 Learning Objectives

By the end of this module, you'll be able to:
- Implement user authentication
- Add advanced state management
- Create API endpoints
- Optimize performance
- Deploy your application
- Add advanced features like file uploads and real-time updates

## 🔒 Step 1: User Authentication

### 1.1 Install Authentication Dependencies

```bash
bun add lucia @lucia-auth/adapter-sqlite
bun add -d @types/bcrypt
```

### 1.2 Set Up Authentication

Create `src/lib/server/auth.ts`:

```typescript
// src/lib/server/auth.ts
import { lucia } from "lucia";
import { sqlite } from "@lucia-auth/adapter-sqlite";
import { db } from "./db";
import { BetterSqlite3Database } from "drizzle-orm/better-sqlite3";

export const auth = lucia({
  env: "DEV", // "PROD" for production
  adapter: sqlite(db as BetterSqlite3Database, {
    user: "user",
    session: "session"
  }),
  
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name
    };
  }
});

export type Auth = typeof auth;
```

### 1.3 Create Authentication Schema

Update `src/lib/server/schema.ts`:

```typescript
// Add to existing schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash')
});

export const sessionsTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});
```

### 1.4 Create Authentication Pages

Create `src/routes/login/+page.svelte`:

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let form;
</script>

<h1 class="text-2xl font-bold mb-4">Login</h1>

{#if form?.error}
  <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
    {form.error}
  </div>
{/if}

<form method="POST" use:enhance class="space-y-4">
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
    <input 
      type="email"
      id="email"
      name="email"
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
  </div>
  
  <div>
    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
    <input 
      type="password"
      id="password"
      name="password"
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
  </div>
  
  <button 
    type="submit"
    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
  >
    Login
  </button>
</form>

<p class="mt-4 text-center text-sm text-gray-600">
  Don't have an account? <a href="/signup" class="text-blue-600 hover:underline">Sign up</a>
</p>
```

Create `src/routes/login/+page.server.ts`:

```typescript
// src/routes/login/+page.server.ts
import { auth } from '$lib/server/auth';
import { LuciaError } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const key = await auth.useKey('email', email, password);
      const session = await auth.createSession({
        userId: key.userId,
        attributes: {}
      });

      locals.auth.setSession(session);
    } catch (e) {
      if (
        e instanceof LuciaError &&
        (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
      ) {
        return fail(400, {
          error: 'Invalid email or password'
        });
      }
      return fail(500, {
        error: 'An unknown error occurred'
      });
    }

    throw redirect(303, '/');
  }
};
```

## 📦 Step 2: Advanced State Management

### 2.1 Create a Todo Store

Create `src/lib/stores/todoStore.ts`:

```typescript
// src/lib/stores/todoStore.ts
import { writable } from 'svelte/store';
import type { Todo } from '$lib/types';

function createTodoStore() {
  const { subscribe, set, update } = writable<Todo[]>([]);

  return {
    subscribe,
    
    // Add a new todo
    addTodo: (text: string) => update(todos => [
      ...todos,
      { id: Date.now(), text, completed: false }
    ]),
    
    // Toggle todo completion
    toggleTodo: (id: number) => update(todos => 
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    ),
    
    // Remove a todo
    removeTodo: (id: number) => update(todos => 
      todos.filter(todo => todo.id !== id)
    ),
    
    // Reset store
    reset: () => set([]),
    
    // Load initial data
    load: (initialTodos: Todo[]) => set(initialTodos)
  };
}

export const todoStore = createTodoStore();
```

### 2.2 Create Types

Create `src/lib/types.ts`:

```typescript
// src/lib/types.ts
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
```

## 🌐 Step 3: API Endpoints

### 3.1 Create a REST API

Create `src/routes/api/todos/+server.ts`:

```typescript
// src/routes/api/todos/+server.ts
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const todos = await db.query.todosTable.findMany({
    orderBy: (todos, { asc }) => [asc(todos.createdAt)]
  });
  
  return json(todos);
};

export const POST: RequestHandler = async ({ request }) => {
  const { text } = await request.json();
  
  if (!text || text.trim() === '') {
    return json({ error: 'Todo text cannot be empty' }, { status: 400 });
  }
  
  const [newTodo] = await db.insert(todosTable)
    .values({ text: text.trim() })
    .returning();
  
  return json(newTodo, { status: 201 });
};
```

### 3.2 Create API Client

Create `src/lib/api/todos.ts`:

```typescript
// src/lib/api/todos.ts
const API_BASE = '/api/todos';

export async function getTodos() {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

export async function createTodo(text: string) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create todo');
  }
  
  return response.json();
}
```

## ⚡ Step 4: Performance Optimization

### 4.1 Add Loading States

Update your todo page to include loading states:

```svelte
<!-- Add to your +page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  export let data;
  
  const loading = derived(page, ($page) => $page.form?.pending);
</script>

{#if $loading}
  <div class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center">
    <div class="bg-white p-4 rounded-lg shadow-lg">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-center">Loading...</p>
    </div>
  </div>
{/if}
```

### 4.2 Implement Infinite Scroll

Create `src/lib/utils/infiniteScroll.ts`:

```typescript
// src/lib/utils/infiniteScroll.ts
export function infiniteScroll(node: HTMLElement, loadMore: () => void) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  }, { threshold: 1.0 });

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
```

## 🚀 Step 5: Deployment

### 5.1 Build for Production

```bash
bun run build
```

### 5.2 Preview Production Build

```bash
bun run preview
```

### 5.3 Deploy to Vercel

Install Vercel adapter:

```bash
bun add -D @sveltejs/adapter-vercel
```

Update `svelte.config.js`:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

export default {
  kit: {
    adapter: adapter()
  },
  preprocess: vitePreprocess()
};
```

Deploy:

```bash
bun run build
vercel
```

### 5.4 Deploy to Netlify

Install Netlify adapter:

```bash
bun add -D @sveltejs/adapter-netlify
```

Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-netlify';
```

## 📁 Step 6: File Uploads

### 6.1 Create Upload Endpoint

Create `src/routes/api/upload/+server.ts`:

```typescript
// src/routes/api/upload/+server.ts
import { writeFile } from 'fs/promises';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const filename = `${Date.now()}-${file.name}`;
  const filepath = `static/uploads/${filename}`;

  try {
    await writeFile(filepath, buffer);
    return json({ 
      success: true,
      filename,
      url: `/uploads/${filename}`
    });
  } catch (error) {
    return json({ error: 'Failed to upload file' }, { status: 500 });
  }
};
```

### 6.2 Create Upload Component

Create `src/lib/components/FileUpload.svelte`:

```svelte
<!-- src/lib/components/FileUpload.svelte -->
<script lang="ts">
  export let onUpload: (url: string) => void;
  let error: string | null = null;
  let isUploading = false;

  async function handleUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    isUploading = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        onUpload(result.url);
      } else {
        error = result.error || 'Upload failed';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      isUploading = false;
      input.value = '';
    }
  }
</script>

<div class="file-upload">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    Upload File
  </label>
  
  <div class="flex items-center justify-center w-full">
    <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
        </svg>
        <p class="mb-2 text-sm text-gray-500">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">PDF, JPG, PNG (MAX. 5MB)</p>
      </div>
      <input 
        id="dropzone-file"
        type="file"
        class="hidden"
        on:change={handleUpload}
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={isUploading}
      />
    </label>
  </div>

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}

  {#if isUploading}
    <div class="mt-2 flex items-center">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
      <span class="text-sm text-gray-600">Uploading...</span>
    </div>
  {/if}
</div>
```

## 🔄 Step 7: Real-time Updates with Server-Sent Events

### 7.1 Create SSE Endpoint

Create `src/routes/api/events/+server.ts`:

```typescript
// src/routes/api/events/+server.ts
import { db } from '$lib/server/db';
import { todosTable } from '$lib/server/schema';

export function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const todos = await db.query.todosTable.findMany();
      controller.enqueue(`data: ${JSON.stringify({ type: 'init', todos })}\n\n`);

      // Set up database change listener (simplified example)
      // In a real app, you'd use a proper event system
      const interval = setInterval(async () => {
        const todos = await db.query.todosTable.findMany();
        controller.enqueue(`data: ${JSON.stringify({ type: 'update', todos })}\n\n`);
      }, 5000);

      // Clean up on client disconnect
      return () => {
        clearInterval(interval);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 7.2 Create SSE Client

Create `src/lib/stores/sseStore.ts`:

```typescript
// src/lib/stores/sseStore.ts
import { writable } from 'svelte/store';

export function createSSEStore(url: string) {
  const { subscribe, set } = writable<any[]>([]);
  let eventSource: EventSource | null = null;

  function start() {
    eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      set(data.todos || []);
    };
    
    eventSource.onerror = () => {
      eventSource?.close();
      // Attempt to reconnect after delay
      setTimeout(start, 3000);
    };
  }

  function stop() {
    eventSource?.close();
    eventSource = null;
  }

  return {
    subscribe,
    start,
    stop
  };
}

export const sseStore = createSSEStore('/api/events');
```

## 🎉 Module 4 Complete!

You've explored advanced SvelteKit topics including:
- ✅ User authentication with Lucia
- ✅ Advanced state management
- ✅ API endpoints and clients
- ✅ Performance optimization
- ✅ Deployment strategies
- ✅ File uploads
- ✅ Real-time updates with SSE

**Next Steps:**
- Practice implementing these features in your projects
- Explore SvelteKit documentation for more advanced topics
- Build a complete application using everything you've learned
- Contribute to open source SvelteKit projects

> "The expert in anything was once a beginner." - Helen Hayes

You've come a long way! Now go build amazing things with SvelteKit! 🚀