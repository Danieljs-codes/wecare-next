import { z } from "zod";

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
    .min(1, { message: 'Years of experience is required' })
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
      if (endTime.hour < startTime.hour) {
        console.log('endTime.hour < startTime.hour');
        console.log(endTime.hour, startTime.hour);
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be more than start time',
          path: ['endTime'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be more than start time',
          path: ['startTime'],
        });
      }
    }),
  timezone: z.string(),
});
