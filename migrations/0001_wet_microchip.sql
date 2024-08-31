CREATE TABLE `patient_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'patient' NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `patient_registrations_email_unique` ON `patient_registrations` (`email`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `fullName`;