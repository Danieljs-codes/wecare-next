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
import { useTransitionRouter as useRouter } from 'next-view-transitions';
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
      price: 0,
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
      router.replace(
        data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
      );
    },
  });

  const isLoading = status === 'pending';

  const onSubmit = (data: Step2DoctorFormData) => {
    mutate(data);
  };

  return (
    <form method="POST" onSubmit={handleSubmit(onSubmit)}>
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
                  <Select.Option
                    className={'text-sm'}
                    id={item.id}
                    textValue={item.name}
                  >
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
        <Controller
          name="price"
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <NumberField
              minValue={1}
              label="Price"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              description="This is the price per hour. You can change this later."
              formatOptions={{
                style: 'currency',
                currency: 'USD',
              }}
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
              rows={4}
              label="About"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />
      </div>
      <SubmitButton className="w-full" isLoading={isLoading}>
        Sign up
      </SubmitButton>
    </form>
  );
};
