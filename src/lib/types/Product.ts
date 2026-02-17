export interface Product {
  id: string;
  name: string;
  internal_price: number;
  price: number;
  available_sizes: Record<string, number>; // more flexible than hardcoding xl, l, m, etc.
  count: number;
  color: string;
  imageUrl: string;
}