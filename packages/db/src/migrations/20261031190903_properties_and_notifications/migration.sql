CREATE TABLE `notification` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'system' NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`url` text,
	`data` text,
	`read_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_notification_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `push_subscription` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL UNIQUE,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`expiration_time` integer,
	`user_agent` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_push_subscription_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `property` (
	`id` text PRIMARY KEY,
	`owner_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`property_type` text DEFAULT 'apartment' NOT NULL,
	`price` integer NOT NULL,
	`price_period` text DEFAULT 'year' NOT NULL,
	`bedrooms` integer DEFAULT 1 NOT NULL,
	`bathrooms` integer DEFAULT 1 NOT NULL,
	`area_sqm` integer,
	`address` text,
	`city` text NOT NULL,
	`state` text DEFAULT 'Lagos' NOT NULL,
	`latitude` real,
	`longitude` real,
	`amenities` text,
	`images` text,
	`status` text DEFAULT 'available' NOT NULL,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`verified_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_property_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `saved_property` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`property_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_saved_property_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_saved_property_property_id_property_id_fk` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `notification_userId_createdAt_idx` ON `notification` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notification_userId_readAt_idx` ON `notification` (`user_id`,`read_at`);--> statement-breakpoint
CREATE INDEX `push_subscription_userId_idx` ON `push_subscription` (`user_id`);--> statement-breakpoint
CREATE INDEX `property_ownerId_idx` ON `property` (`owner_id`);--> statement-breakpoint
CREATE INDEX `property_city_idx` ON `property` (`city`);--> statement-breakpoint
CREATE INDEX `property_price_idx` ON `property` (`price`);--> statement-breakpoint
CREATE INDEX `property_verificationStatus_idx` ON `property` (`verification_status`);--> statement-breakpoint
CREATE INDEX `property_bedrooms_idx` ON `property` (`bedrooms`);--> statement-breakpoint
CREATE UNIQUE INDEX `saved_property_user_property_uq` ON `saved_property` (`user_id`,`property_id`);--> statement-breakpoint
CREATE INDEX `saved_property_userId_idx` ON `saved_property` (`user_id`);