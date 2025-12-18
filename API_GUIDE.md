# API Guide for Adding `total_available` Field

This guide will help you add a `total_available` field to your items in your Svelte project.

## Current Project Structure

Your project currently uses a client-side data approach where items are defined directly in the `Gallery.svelte` component. There's no separate API endpoint yet.

## Solution Options

### Option 1: Calculate in the Component (Simple Approach)

This is the quickest way to add the `total_available` field to your existing setup.

1. **Add a helper function** to calculate the total:

```svelte
<script>
    // Helper function to calculate total available
    function calculateTotalAvailable(sizes) {
        return Object.values(sizes).reduce((sum, count) => sum + count, 0);
    }
</script>
```

2. **Update your data** to include the `total_available` field:

```javascript
let data = [
    {
        id: '001',
        name: 'Camiseta (T-Shirt)',
        internal_cost: 12000,
        cost: 36000,
        available_sizes: { xl: 20, l: 10, m: 2, s: 500, u: 0 },
        color: 'white',
        imageUrl: '/assets/misaca.png',
        total_available: calculateTotalAvailable({ xl: 20, l: 10, m: 2, s: 500, u: 0 })
    },
    {
        id: '002',
        name: 'pantaloncito',
        internal_cost: 30000,
        cost: 108000,
        available_sizes: { xl: 1, l: 1, m: 0, s: 10, u: 0 },
        color: 'blue',
        imageUrl: '/assets/pantaloncito.png',
        total_available: calculateTotalAvailable({ xl: 1, l: 1, m: 0, s: 10, u: 0 })
    }
];
```

### Option 2: Create a Reusable Store (Better for Future Growth)

This approach separates your data from the component, making it more maintainable.

1. **Create a new file**: `src/lib/stores/items.js`

```javascript
import { writable } from 'svelte/store';

function calculateTotalAvailable(sizes) {
    return Object.values(sizes).reduce((sum, count) => sum + count, 0);
}

const initialItems = [
    {
        id: '001',
        name: 'Camiseta (T-Shirt)',
        internal_cost: 12000,
        cost: 36000,
        available_sizes: { xl: 20, l: 10, m: 2, s: 500, u: 0 },
        color: 'white',
        imageUrl: '/assets/misaca.png',
        total_available: calculateTotalAvailable({ xl: 20, l: 10, m: 2, s: 500, u: 0 })
    },
    {
        id: '002',
        name: 'pantaloncito',
        internal_cost: 30000,
        cost: 108000,
        available_sizes: { xl: 1, l: 1, m: 0, s: 10, u: 0 },
        color: 'blue',
        imageUrl: '/assets/pantaloncito.png',
        total_available: calculateTotalAvailable({ xl: 1, l: 1, m: 0, s: 10, u: 0 })
    }
];

export const items = writable(initialItems);
```

2. **Update your Gallery component** to use the store:

```svelte
<script>
    import { items } from '$lib/stores/items';
    // ... rest of your component
</script>
```

## Future API Consideration

When you're ready to move to a real API:

1. **Create an API endpoint** (e.g., `/api/items`)
2. **Move data to a database**
3. **Have the API calculate and return** the `total_available` field

### Example API Structure

```javascript
// src/routes/api/items/+server.js
import { json } from '@sveltejs/kit';

function calculateTotalAvailable(sizes) {
    return Object.values(sizes).reduce((sum, count) => sum + count, 0);
}

export function GET() {
    const items = [
        {
            id: '001',
            name: 'Camiseta (T-Shirt)',
            // ... other fields
            total_available: calculateTotalAvailable(available_sizes)
        }
        // ... other items
    ];
    
    return json(items);
}
```

## Benefits of Adding `total_available`

- **Efficiency**: Clients don't need to calculate the sum themselves
- **Consistency**: The sum is calculated once and shared across all clients
- **Clarity**: The total inventory count is immediately visible in the response

## Implementation Steps

1. Choose between Option 1 (simple) or Option 2 (better for growth)
2. Add the helper function to calculate totals
3. Update your data structure to include the new field
4. Test your implementation

## Testing Your Implementation

After implementing, you can test by:
1. Checking that the `total_available` field appears in your data
2. Verifying the calculations are correct (e.g., 20+10+2+500+0 = 532 for the first item)
3. Ensuring your UI displays the new field if needed

## Next Steps

- Consider moving to a database-backed API when your data grows
- Think about adding more calculated fields if needed
- Explore Svelte stores for better state management as your app grows