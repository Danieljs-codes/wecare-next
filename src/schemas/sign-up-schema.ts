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
  timezone: z.string(),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }),
});

export type Step2DoctorFormData = z.infer<typeof doctorStep2Schema>;
