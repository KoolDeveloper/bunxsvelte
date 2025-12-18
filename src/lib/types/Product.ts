export interface Product {
  id: string;
  name: string;
  internal_cost: number;
  cost: number;
  available_sizes: Record<string, number>; // more flexible than hardcoding xl, l, m, etc.
  color: string;
  imageUrl: string;
}