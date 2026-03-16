-- Migration: compatibility safety net for schema alignment.
-- This migration is intentionally non-destructive and idempotent.
-- Column-level alignment is handled by 0001_fix_schema_alignment.sql.

-- Ensure trip_activities exists in its aligned shape for environments
-- where it was never created.
CREATE TABLE IF NOT EXISTS `trip_activities` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `trip_id` TEXT NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `location` TEXT,
  `scheduled_date` INTEGER,
  `estimated_duration` INTEGER,
  `category` TEXT,
  `completed` INTEGER DEFAULT 0,
  `created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
  `updated_at` INTEGER,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL UNIQUE,
  `theme` TEXT NOT NULL DEFAULT 'light',
  `language` TEXT NOT NULL DEFAULT 'English (US)',
  `units` TEXT NOT NULL DEFAULT 'metric',
  `two_factor_enabled` INTEGER NOT NULL DEFAULT 0,
  `notifications_enabled` INTEGER NOT NULL DEFAULT 1,
  `connected_google` INTEGER NOT NULL DEFAULT 0,
  `connected_apple` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
CREATE UNIQUE INDEX IF NOT EXISTS `app_settings_user_id_unique` ON `app_settings` (`user_id`);

-- Create two_factor_auth table
CREATE TABLE IF NOT EXISTS `two_factor_auth` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `user_id` TEXT NOT NULL UNIQUE,
  `secret` TEXT NOT NULL,
  `backup_code` TEXT NOT NULL,
  `enabled` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
CREATE UNIQUE INDEX IF NOT EXISTS `two_factor_auth_user_id_unique` ON `two_factor_auth` (`user_id`);
