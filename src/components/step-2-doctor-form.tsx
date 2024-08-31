'use client';

import { createStep2Registration } from '@/app/(auth)/sign-up/action';
import {
  doctorStep2Schema,
  Step2DoctorFormData,
} from '@/schemas/sign-up-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Time } from '@internationalized/date';
import { getUserTimezone } from '@lib/utils';
import { useMutation } from '@tanstack/react-query';
import { NumberField } from '@ui/number-field';
import { Select } from '@ui/select';
import { SubmitButton } from '@ui/submit-button';
import { Textarea } from '@ui/textarea';
import { TimeField } from '@ui/time-field';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const Step2DoctorForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { handleSubmit, control } = useForm<Step2DoctorFormData>({
    resolver: zodResolver(doctorStep2Schema),
    defaultValues: {
      specialization: undefined,
      yearsOfExperience: undefined,
      availableHours: { startTime: undefined, endTime: undefined },
      timezone: getUserTimezone(),
      bio: '',
    },
  });

  const { mutate, status } = useMutation({
    mutationKey: ['signUpStep2'],
    mutationFn: async (data: Step2DoctorFormData) => {
      const res = await createStep2Registration(data);

      if (!res.success) {
        setError(res.message);
        throw new Error(res.message);
      }

      return res;
    },

    onSuccess: data => {
      toast.success(data.message);
      router.replace('/dashboard');
    },
  });

  const isLoading = status === 'pending';

  const onSubmit = (data: Step2DoctorFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Controller
          name="specialization"
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Select
              label="Specialization"
              placeholder="Select specialization"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              onSelectionChange={selected => field.onChange(selected)}
            >
              <Select.Trigger />
              <Select.List
                items={doctorStep2Schema.shape.specialization.options.map(
                  item => ({ id: item, name: item })
                )}
              >
                {item => (
                  <Select.Option id={item.id} textValue={item.name}>
                    {item.name}
                  </Select.Option>
                )}
              </Select.List>
            </Select>
          )}
        />
        <Controller
          name="yearsOfExperience"
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <NumberField
              minValue={1}
              label="Years of Experience"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />
        <div className="flex items-center gap-x-2">
          <Controller
            name="availableHours.startTime"
            control={control}
            render={({
              field: { value, onChange, ref, ...field },
              fieldState: { error },
            }) => (
              <TimeField
                label="Start Time"
                value={value ? new Time(value.hour, value.minute) : null}
                onChange={newValue => {
                  onChange(
                    newValue
                      ? { hour: newValue.hour, minute: newValue.minute }
                      : null
                  );
                }}
                {...field}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            )}
          />
          <Controller
            name="availableHours.endTime"
            control={control}
            render={({
              field: { value, onChange, ref, ...field },
              fieldState: { error },
            }) => (
              <TimeField
                label="End Time"
                value={value ? new Time(value.hour, value.minute) : null}
                onChange={newValue =>
                  onChange(
                    newValue
                      ? { hour: newValue.hour, minute: newValue.minute }
                      : null
                  )
                }
                {...field}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            )}
          />
        </div>
        <Controller
          name="bio"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Textarea
              className="text-sm"
              label="Bio"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />
      </div>
      <SubmitButton isLoading={isLoading}>Sign up</SubmitButton>
    </form>
  );
};
