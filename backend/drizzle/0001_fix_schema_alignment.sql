PRAGMA foreign_keys = OFF;

UPDATE `users` SET `updated_at` = `created_at` WHERE `updated_at` IS NULL;
UPDATE `trips` SET `updated_at` = `created_at` WHERE `updated_at` IS NULL;

CREATE TABLE IF NOT EXISTS `trip_activities` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`trip_id` TEXT NOT NULL,
	`activity` TEXT NOT NULL,
	`notes` TEXT,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE `trip_activities_new` (
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
	`updated_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
INSERT INTO `trip_activities_new`
	(`id`, `trip_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT `id`, `trip_id`, `activity`, `notes`, `created_at`, `created_at` FROM `trip_activities`;
DROP TABLE `trip_activities`;
ALTER TABLE `trip_activities_new` RENAME TO `trip_activities`;

-- ═══════════════════════════════════════════════════
-- STEP 3: Rebuild wellness_logs
-- Changes: value REAL → TEXT (JSON storage), add created_at + updated_at
-- Old: id, user_id, type, trip_id, value REAL, rating, duration, notes, logged_at
-- New: id, user_id, trip_id, type, value TEXT, rating, duration, notes,
--      logged_at, created_at, updated_at
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS `wellness_logs` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`type` TEXT NOT NULL,
	`trip_id` TEXT,
	`value` REAL,
	`rating` INTEGER,
	`duration` INTEGER,
	`notes` TEXT,
	`logged_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE TABLE `wellness_logs_new` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`trip_id` TEXT,
	`type` TEXT NOT NULL,
	`value` TEXT,
	`rating` INTEGER,
	`duration` INTEGER,
	`notes` TEXT,
	`logged_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `wellness_logs_new`
	(`id`, `user_id`, `trip_id`, `type`, `value`, `rating`, `duration`, `notes`, `logged_at`, `created_at`, `updated_at`)
	SELECT
		`id`, `user_id`, `trip_id`, `type`,
		CAST(`value` AS TEXT),
		`rating`, `duration`, `notes`,
		`logged_at`, `logged_at`, `logged_at`
	FROM `wellness_logs`;
--> statement-breakpoint
DROP TABLE `wellness_logs`;
--> statement-breakpoint
ALTER TABLE `wellness_logs_new` RENAME TO `wellness_logs`;
--> statement-breakpoint

-- ═══════════════════════════════════════════════════
-- STEP 4: Fix health_metrics — add missing created_at column
-- (unit NOT NULL enforcement is handled at the ORM layer)
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS `health_metrics` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`metric_type` TEXT NOT NULL,
	`value` REAL NOT NULL,
	`unit` TEXT NOT NULL,
	`recorded_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE `health_metrics_new` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`metric_type` TEXT NOT NULL,
	`value` REAL NOT NULL,
	`unit` TEXT NOT NULL,
	`recorded_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
INSERT INTO `health_metrics_new`
	(`id`, `user_id`, `metric_type`, `value`, `unit`, `recorded_at`, `created_at`)
	SELECT `id`, `user_id`, `metric_type`, `value`, `unit`, `recorded_at`, `recorded_at`
	FROM `health_metrics`;
--> statement-breakpoint
DROP TABLE `health_metrics`;
--> statement-breakpoint
ALTER TABLE `health_metrics_new` RENAME TO `health_metrics`;
--> statement-breakpoint

-- ═══════════════════════════════════════════════════
-- STEP 5: Create app_settings table (was entirely missing)
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS `app_settings` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`theme` TEXT NOT NULL DEFAULT 'light',
	`language` TEXT NOT NULL DEFAULT 'English (US)',
	`units` TEXT NOT NULL DEFAULT 'metric',
	`two_factor_enabled` INTEGER NOT NULL DEFAULT 0,
	`notifications_enabled` INTEGER NOT NULL DEFAULT 1,
	`connected_google` INTEGER NOT NULL DEFAULT 0,
	`connected_apple` INTEGER NOT NULL DEFAULT 0,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX IF NOT EXISTS `app_settings_user_id_unique` ON `app_settings` (`user_id`);
--> statement-breakpoint

-- ═══════════════════════════════════════════════════
-- STEP 6: Create two_factor_auth table (was entirely missing)
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS `two_factor_auth` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`secret` TEXT NOT NULL,
	`backup_code` TEXT NOT NULL,
	`enabled` INTEGER NOT NULL DEFAULT 0,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX IF NOT EXISTS `two_factor_auth_user_id_unique` ON `two_factor_auth` (`user_id`);
--> statement-breakpoint

PRAGMA foreign_keys = ON;
