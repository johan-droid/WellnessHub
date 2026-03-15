import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  destination: text('destination'),
  startDate: integer('start_date'),
  endDate: integer('end_date'),
  status: text('status').default('planning'), // planning, ongoing, completed
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // e.g., 'symptom', 'period', 'mood'
  notes: text('notes'),
  loggedAt: integer('logged_at').notNull().default(Date.now()),
});
