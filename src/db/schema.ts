import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. User-Tabelle (Erweitert für KI-Engagement-Analyse)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  
  // --- NEU FÜR KI-ANALYSE ---
  lastLogin: timestamp('last_login').defaultNow(),
  loginCount: integer('login_count').default(1),
  featureClicks: integer('feature_clicks').default(0),
});

// 2. Adressen-Tabelle
export const adressen = pgTable('adressen', {
  id: serial('id').primaryKey(),
  strasse: text('strasse').notNull(),
  plz: text('plz').notNull(),
  stadt: text('stadt').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// 3. Anträge-Tabelle
export const antraege = pgTable('antraege', {
  id: serial('id').primaryKey(),
  titel: text('titel').notNull(),
  status: text('status').default('offen'),
  beschreibung: text('beschreibung'),
  createdAt: timestamp('created_at').defaultNow(),
  // Nullable, damit bereits bestehende Anträge (ohne Besitzer) nicht durch
  // einen erzwungenen Push mit NOT NULL brechen.
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

// 4. One-to-One Relationen
export const usersRelations = relations(users, ({ one }) => ({
  adresse: one(adressen, {
    fields: [users.id],         
    references: [adressen.id],  
  }),
}));

export const adressenRelations = relations(adressen, ({ one }) => ({
  user: one(users, {
    fields: [adressen.userId],
    references: [users.id],
  }),
}));

export const antraegeRelations = relations(antraege, ({ one }) => ({
  user: one(users, {
    fields: [antraege.userId],
    references: [users.id],
  }),
}));