import { CalendarDate, getLocalTimeZone, now } from '@internationalized/date';
import { z } from 'zod';

export const doctorStep2Schema = z.object({
  specialization: z.enum(
    [
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Oncology',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Surgery',
      'Urology',
      'Orthopedics',
      'Ophthalmology',
      'Gynecology',
      'Anesthesiology',
    ],
    {
      required_error: 'Specialization is required',
      invalid_type_error: 'Invalid specialization',
    }
  ),
  yearsOfExperience: z
    .number({
      required_error: 'Years of experience is required',
    })
    .positive({ message: 'Years of experience must be positive' })
    .min(1, { message: 'Years of experience is required' })
    .min(5, { message: 'You must have at least 5 years of experience' })
    .max(100, { message: 'Years of experience must be at most 100' }),

  availableHours: z
    .object({
      startTime: z.object({
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
      }),
      endTime: z.object({
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
      }),
    })
    .superRefine(({ startTime, endTime }, ctx) => {
      const start = startTime.hour * 60 + startTime.minute;
      const end = endTime.hour * 60 + endTime.minute;

      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be past start time',
          path: ['endTime'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be past start time',
          path: ['startTime'],
        });
      } else if (end - start < 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be at least one hour after start time',
          path: ['endTime'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be at least one hour after start time',
          path: ['startTime'],
        });
      }
    }),
  timezone: z.string().transform(val => val.toLowerCase()),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }),
  price: z
    .number({
      invalid_type_error: 'Price must be a number',
    })
    .positive({ message: 'Price must be positive' }),
});

export type Step2DoctorFormData = z.infer<typeof doctorStep2Schema>;

export const patientStep2Schema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Invalid blood type' }),
  }),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Invalid gender' }),
  }),
  genoType: z.enum(['AA', 'AS', 'SS'], {
    errorMap: () => ({ message: 'Invalid genotype' }),
  }),
  birthDate: z
    .custom<CalendarDate>(val => val instanceof CalendarDate, {
      message: 'Invalid birth date',
    })
    .refine(
      val => {
        const currentTime = now(getLocalTimeZone());
        return val.compare(currentTime) <= 0;
      },
      {
        message: 'Birth date cannot be in the future',
      }
    ),
  occupation: z
    .string()
    .min(1, { message: 'Occupation is required' })
    .max(100, { message: 'Occupation must be 100 characters or less' }),
  mobileNumber: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: 'Mobile number must be a valid number' })
    .transform((val) => val.replace(/\D/g, '')),
  address: z
    .string()
    .min(1, { message: 'Address is required' })
    .max(255, { message: 'Address must be 255 characters or less' }),
  timezone: z.string(),
});

export type Step2PatientFormData = z.infer<typeof patientStep2Schema>;
