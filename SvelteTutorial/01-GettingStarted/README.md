# 01: Getting Started with SvelteKit

**Welcome to the first module!** Here you'll learn the fundamentals of SvelteKit and set up your development environment.

## 🎯 Learning Objectives

By the end of this module, you'll be able to:
- Understand SvelteKit's project structure
- Set up a new SvelteKit project
- Navigate the file system
- Run the development server
- Understand basic Svelte syntax

## 🚀 Step 1: Create Your SvelteKit Project

### 1.1 Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 1.2 Create a new SvelteKit project

```bash
bun create svelte@latest my-svelte-app
cd my-svelte-app
```

### 1.3 Install dependencies

```bash
bun install
```

### 1.4 Start the development server

```bash
bun dev
```

Your app should now be running at `http://localhost:5173`

## 📁 Step 2: Understanding the Project Structure

Let's explore the key directories:

```
src/
├── routes/           # Your pages and API endpoints
│   ├── +page.svelte  # Homepage
│   └── +layout.svelte # Shared layout
├── lib/             # Reusable components and utilities
├── app.html         # Main HTML template
└── app.d.ts         # TypeScript definitions
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/routes/+page.svelte` | Your homepage content |
| `src/routes/+layout.svelte` | Shared layout for all pages |
| `src/lib/` | Reusable components and utilities |
| `src/app.html` | HTML template for your app |
| `svelte.config.js` | SvelteKit configuration |
| `vite.config.ts` | Vite build configuration |

## 🧩 Step 3: Basic Svelte Syntax

### 3.1 Reactive Variables

```svelte
<script>
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
```

### 3.2 Conditional Rendering

```svelte
{#if user.loggedIn}
  <p>Welcome, {user.name}!</p>
{:else}
  <p>Please log in.</p>
{/if}
```

### 3.3 Loops

```svelte
<ul>
  {#each items as item}
    <li>{item.name}</li>
  {:else}
    <li>No items found</li>
  {/each}
</ul>
```

### 3.4 Event Handling

```svelte
<input 
  type="text"
  bind:value={name}
  on:input={handleInput}
  placeholder="Enter your name"
/>
```

## 🎨 Step 4: Your First Svelte Component

Let's create a simple counter component:

### 4.1 Create the component file

```bash
mkdir -p src/lib/components
touch src/lib/components/Counter.svelte
```

### 4.2 Add the counter code

```svelte
<!-- src/lib/components/Counter.svelte -->
<script lang="ts">
  let count = 0;
  
  function increment() {
    count += 1;
  }
  
  function decrement() {
    count = Math.max(0, count - 1);
  }
  
  function reset() {
    count = 0;
  }
</script>

<div class="counter p-4 border rounded-lg shadow-sm">
  <div class="flex items-center justify-center space-x-4">
    <button 
      on:click={decrement}
      disabled={count === 0}
      class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
    >
      - 
    </button>
    
    <span class="text-xl font-semibold w-8 text-center">
      {count}
    </span>
    
    <button 
      on:click={increment}
      class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      + 
    </button>
  </div>
  
  <div class="mt-2 text-center">
    <button 
      on:click={reset}
      class="text-sm text-gray-500 hover:text-gray-700"
    >
      Reset
    </button>
  </div>
</div>

<style>
  .counter {
    max-width: 200px;
    margin: 0 auto;
  }
</style>
```

### 4.3 Use the component in your page

Update `src/routes/+page.svelte`:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Counter from '$lib/components/Counter.svelte';
</script>

<h1 class="text-3xl font-bold mb-6 text-center">
  Welcome to SvelteKit!
</h1>

<div class="max-w-md mx-auto p-4">
  <Counter />
</div>
```

### 4.4 Test your component

Your counter should now be visible at `http://localhost:5173` and you should be able to:
- Increment the count with the + button
- Decrement the count with the - button
- Reset to zero with the Reset button

## 🧪 Step 5: Basic Testing Setup

Let's set up a simple testing environment:

### 5.1 Install testing dependencies

```bash
bun add -d vitest @testing-library/svelte jsdom
```

### 5.2 Configure Vitest

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
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

### 5.3 Create your first test

Create `src/lib/components/Counter.test.ts`:

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
    
    await fireEvent.click(incrementButton);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should decrement count when - button is clicked', async () => {
    render(Counter);
    const incrementButton = screen.getByText('+');
    const decrementButton = screen.getByText('-');
    
    // First increment to have something to decrement
    await fireEvent.click(incrementButton);
    
    // Now decrement
    await fireEvent.click(decrementButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should not go below 0', async () => {
    render(Counter);
    const decrementButton = screen.getByText('-');
    
    // Try to decrement when count is 0
    await fireEvent.click(decrementButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should reset count to 0 when reset button is clicked', async () => {
    render(Counter);
    const incrementButton = screen.getByText('+');
    const resetButton = screen.getByText('Reset');
    
    // Increment a few times
    await fireEvent.click(incrementButton);
    await fireEvent.click(incrementButton);
    
    // Reset
    await fireEvent.click(resetButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
```

### 5.4 Add test script to package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch"
  }
}
```

### 5.5 Run your tests

```bash
bun run test
```

All tests should pass! 🎉

## 🎉 Module 1 Complete!

You've successfully:
- ✅ Set up a SvelteKit project
- ✅ Understood the project structure
- ✅ Learned basic Svelte syntax
- ✅ Created your first component
- ✅ Set up basic testing

**Next Steps:**
- Proceed to [Module 2: CRUD Foundations](../02-CRUD-Foundations/README.md)
- Experiment with modifying the counter component
- Try creating additional simple components

> "The journey of a thousand miles begins with one step." - Lao Tzu

You've taken your first steps with SvelteKit! Keep going!