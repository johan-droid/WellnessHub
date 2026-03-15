-- Users table
CREATE TABLE `users` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`email` TEXT NOT NULL,
	`password_hash` TEXT NOT NULL,
	`first_name` TEXT,
	`last_name` TEXT,
	`bio` TEXT,
	`profile_picture` TEXT,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` INTEGER
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- Trips table
CREATE TABLE `trips` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`title` TEXT NOT NULL,
	`destination` TEXT,
	`description` TEXT,
	`start_date` INTEGER,
	`end_date` INTEGER,
	`budget` REAL,
	`status` TEXT DEFAULT 'planning',
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`updated_at` INTEGER,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Trip Activities table
CREATE TABLE `trip_activities` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`trip_id` TEXT NOT NULL,
	`activity` TEXT NOT NULL,
	`notes` TEXT,
	`created_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Wellness Logs table
CREATE TABLE `wellness_logs` (
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

-- Health Metrics table
CREATE TABLE `health_metrics` (
	`id` TEXT PRIMARY KEY NOT NULL,
	`user_id` TEXT NOT NULL,
	`metric_type` TEXT NOT NULL,
	`value` REAL NOT NULL,
	`unit` TEXT,
	`recorded_at` INTEGER DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);