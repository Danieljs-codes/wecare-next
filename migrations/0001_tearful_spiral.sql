ALTER TABLE `appointments` ADD `rescheduleCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `lastRescheduledAt` text;