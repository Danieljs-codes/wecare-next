'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '@/components/ui/text-field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader } from '@ui/loader';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { createStep1Registration } from '@/app/(auth)/sign-up/action';
import { toast } from 'sonner';
import { useTransitionRouter as useRouter } from 'next-view-transitions';
import { formSchema } from '@/schemas/sign-in-schema';
import { Tooltip } from '@ui/tooltip';
import { IconEye, IconEyeOff } from 'justd-icons';
import { Note } from '@ui/note';

export type FormData = z.infer<typeof formSchema>;

export function Step1Form({ initialData }: { initialData?: FormData }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { mutate, status } = useMutation({
    mutationKey: ['sign-up-step-1'],
    mutationFn: async (data: FormData) => {
      const res = await createStep1Registration(data);

      if (!res.success) {
        setError(res.message);
        throw new Error(res.message);
      }

      return res;
    },

    onSuccess: data => {
      toast.success(data.message);
      router.push('/sign-up?step=2');
    },
  });

  const isLoading = status === 'pending';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      password: initialData?.password || '',
      role: initialData?.role,
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? <Note intent="danger">{error}</Note> : null}
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            label="First Name"
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <TextField
            label="Last Name"
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            label="Email"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            {...field}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            suffix={
              <Tooltip delay={0}>
                <Button
                  size="square-petite"
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  appearance="outline"
                >
                  {passwordVisible ? <IconEyeOff /> : <IconEye />}
                </Button>
                <Tooltip.Content className="text-[11px]">
                  {passwordVisible ? 'Hide password' : 'Show password'}
                </Tooltip.Content>
              </Tooltip>
            }
            {...field}
          />
        )}
      />
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Select
            label="Role"
            isInvalid={!!errors.role}
            errorMessage={errors.role?.message}
            placeholder="Select role"
            defaultSelectedKey={initialData?.role}
            onSelectionChange={val => field.onChange(val)}
            {...field}
          >
            <Select.Trigger />
            <Select.List
              items={formSchema.shape.role.options.map(option => ({
                id: option,
                name: option.charAt(0).toUpperCase() + option.slice(1),
              }))}
            >
              {item => (
                <Select.Option
                  className="text-sm"
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

      <Button
        size="small"
        type="submit"
        className={cn(
          'relative mt-6 w-full overflow-hidden',
          isLoading && 'pointer-events-none'
        )}
      >
        {isLoading ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader variant="spin" />
          </motion.div>
        ) : (
          'Next'
        )}
      </Button>
    </form>
  );
}
