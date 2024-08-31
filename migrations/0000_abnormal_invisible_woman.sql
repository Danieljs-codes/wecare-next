CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`appointmentStart` text NOT NULL,
	`appointmentEnd` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`roomName` text,
	`doctorToken` text,
	`patientToken` text,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
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
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `patient_doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`patientId` text NOT NULL,
	`doctorId` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
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
	`fullName` text NOT NULL,
	`role` text DEFAULT 'patient' NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text NOT NULL,
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updatedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_userId_unique` ON `doctors` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `patientDoctors_patientId_doctorId_key` ON `patient_doctors` (`patientId`,`doctorId`);--> statement-breakpoint
CREATE UNIQUE INDEX `patients_userId_unique` ON `patients` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);