CREATE INDEX `appointments_start_idx` ON `appointments` (`appointmentStart`);--> statement-breakpoint
CREATE INDEX `appointments_patient_doctor_idx` ON `appointments` (`patientId`,`doctorId`);--> statement-breakpoint
CREATE INDEX `doctor_notifications_doctor_idx` ON `doctor_notifications` (`doctorId`);--> statement-breakpoint
CREATE INDEX `doctor_notifications_is_read_idx` ON `doctor_notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `patient_notifications_patient_idx` ON `patient_notifications` (`patientId`);--> statement-breakpoint
CREATE INDEX `patient_notifications_is_read_idx` ON `patient_notifications` (`isRead`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);