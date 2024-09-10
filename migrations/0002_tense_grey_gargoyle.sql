ALTER TABLE `payments` ADD `stripe_payment_intent_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `status`;