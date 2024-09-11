'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Note } from '@ui/note';
import { Select } from '@ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TextField } from '@ui/text-field';
import { DateField } from '@ui/date-field';
import { useRouter } from 'next/navigation';
import {
  patientStep2Schema,
  Step2PatientFormData,
} from '@/schemas/sign-up-schema';
import { SubmitButton } from '@ui/submit-button';
import { getUserTimezone } from '@lib/utils';
import { createStep2PatientRegistration } from '@/app/(auth)/sign-up/action';

export function Step2PatientForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, status } = useMutation({
    mutationKey: ['registerStep2Patient'],
    mutationFn: async (data: Step2PatientFormData) => {
      const { birthDate, ...rest } = data;
      const res = await createStep2PatientRegistration({
        ...rest,
        birthDate: {
          year: birthDate.year,
          month: birthDate.month,
          day: birthDate.day,
        },
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    },
    onSuccess: async data => {
      toast.success(data.message);
      router.replace(
        data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
      );
    },
    onError: error => {
      setError('root', { type: 'manual', message: error.message });
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof patientStep2Schema>>({
    resolver: zodResolver(patientStep2Schema),
    defaultValues: {
      bloodType: undefined,
      gender: undefined,
      genoType: undefined,
      birthDate: undefined,
      occupation: '',
      mobileNumber: '',
      address: '',
      timezone: getUserTimezone(),
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const isLoading = status === 'pending';

  const onSubmit = handleSubmit(data => {
    mutate(data);
  });

  return (
    <form method="POST" onSubmit={onSubmit} className="w-full">
      {errors.root && <Note intent="danger">{errors.root.message}</Note>}
      <div className="space-y-4">
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="Gender"
              placeholder="Select gender"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              onSelectionChange={selected => field.onChange(selected)}
            >
              <Select.Trigger />
              <Select.List
                items={patientStep2Schema.shape.gender.options.map(item => ({
                  id: item,
                  name: item,
                }))}
              >
                {item => (
                  <Select.Option
                    className="capitalize"
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
          name="genoType"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="Genotype"
              placeholder="Select genotype"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              onSelectionChange={selected => field.onChange(selected)}
            >
              <Select.Trigger />
              <Select.List
                items={patientStep2Schema.shape.genoType.options.map(item => ({
                  id: item,
                  name: item,
                }))}
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
          name="bloodType"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="Blood Type"
              placeholder="Select blood type"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              onSelectionChange={selected => field.onChange(selected)}
            >
              <Select.Trigger />
              <Select.List
                items={patientStep2Schema.shape.bloodType.options.map(item => ({
                  id: item,
                  name: item,
                }))}
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

        {/* Similar Select components for gender and genoType */}

        <Controller
          name="birthDate"
          control={control}
          render={({
            field: { value, onChange, ref, ...field },
            fieldState: { error },
          }) => (
            <DateField
              label="Birth Date"
              value={value}
              onChange={onChange}
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />

        <Controller
          name="occupation"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              label="Occupation"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />

        <Controller
          name="mobileNumber"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              label="Mobile Number"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              label="Address"
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
}

export default Step2PatientForm;
