import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

//tables

export const colorsTable = sqliteTable('colors', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	hex: text('hex').notNull()
});

export const itemsTable = sqliteTable('items', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	acquisition_cost: integer('acquisition_cost', { mode: 'number' }),
	displayable_cost: integer('displayable_cost', { mode: 'number' }),
	discount: integer('discount', { mode: 'number' }),
	inventory: text('inventory', { mode: 'json' })
		.$type<Record<string, Record<string, number>>>()
		.notNull()
		.default({}),
	image_url: text('image_url')
});

export const customersTable = sqliteTable('customers', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

export const salesTable = sqliteTable('sales', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	customer_id: integer('customer_id')
		.notNull()
		.references(() => customersTable.id),
	total: integer('total', { mode: 'number' }).notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

//middleman

export const salesItemsTable = sqliteTable('sales_items', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	sale_id: integer('sale_id')
		.notNull()
		.references(() => salesTable.id),
	item_id: integer('item_id')
		.notNull()
		.references(() => itemsTable.id),
	quantity: integer('quantity', { mode: 'number' }).notNull(),
	price_at_sale: integer('price_at_sale', { mode: 'number' }).notNull(),
	color_id: text('color_id')
		.notNull()
		.references(() => colorsTable.id),
	size: text('size')
});

//relationships

export const customersRelations = relations(customersTable, ({ many }) => ({
	sales: many(salesTable)
}));

export const salesRelations = relations(salesTable, ({ one, many }) => ({
	customer: one(customersTable, {
		fields: [salesTable.customer_id],
		references: [customersTable.id]
	}),
	items: many(salesItemsTable)
}));

export const itemsRelations = relations(itemsTable, ({ many }) => ({
	salesData: many(salesItemsTable)
}));

export const salesItemsRelations = relations(salesItemsTable, ({ one }) => ({
	sale: one(salesTable, {
		fields: [salesItemsTable.sale_id],
		references: [salesTable.id]
	}),
	item: one(itemsTable, {
		fields: [salesItemsTable.item_id],
		references: [itemsTable.id]
	})
}));
