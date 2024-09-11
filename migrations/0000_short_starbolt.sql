CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`appointmentStart` text NOT NULL,
	`appointmentEnd` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`reason` text,
	`notes` text,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`initiatedBy` text NOT NULL,
	`rescheduleCount` integer DEFAULT 0 NOT NULL,
	`lastRescheduledAt` text,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `doctor_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`doctorId` text NOT NULL,
	`message` text NOT NULL,
	`isRead` integer NOT NULL,
	`type` text NOT NULL,
	`appointmentId` text,
	`appointmentStartTime` text,
	`appointmentEndTime` text,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`specialization` text NOT NULL,
	`yearsOfExperience` integer NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`timezone` text NOT NULL,
	`bio` text NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `patient_doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `patient_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`message` text NOT NULL,
	`isRead` integer NOT NULL,
	`type` text NOT NULL,
	`appointmentId` text,
	`appointmentStartTime` text,
	`appointmentEndTime` text,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `patient_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`bloodType` text NOT NULL,
	`gender` text NOT NULL,
	`genoType` text NOT NULL,
	`birthDate` text NOT NULL,
	`occupation` text NOT NULL,
	`mobileNumber` text NOT NULL,
	`address` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`timezone` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`appointmentId` text NOT NULL,
	`amount` integer NOT NULL,
	`refundAmount` integer,
	`refundId` text,
	`stripe_payment_intent_id` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `surgeries` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`surgeryTime` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointments_start_idx` ON `appointments` (`appointmentStart`);--> statement-breakpoint
CREATE INDEX `appointments_patient_doctor_idx` ON `appointments` (`patientId`,`doctorId`);--> statement-breakpoint
CREATE INDEX `doctor_notifications_doctor_idx` ON `doctor_notifications` (`doctorId`);--> statement-breakpoint
CREATE INDEX `doctor_notifications_is_read_idx` ON `doctor_notifications` (`isRead`);--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_userId_unique` ON `doctors` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `patientDoctors_patientId_doctorId_key` ON `patient_doctors` (`patientId`,`doctorId`);--> statement-breakpoint
CREATE INDEX `patient_notifications_patient_idx` ON `patient_notifications` (`patientId`);--> statement-breakpoint
CREATE INDEX `patient_notifications_is_read_idx` ON `patient_notifications` (`isRead`);--> statement-breakpoint
CREATE UNIQUE INDEX `patients_userId_unique` ON `patients` (`userId`);--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);