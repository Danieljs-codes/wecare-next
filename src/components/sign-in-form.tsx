'use client';

import { useForm, Controller, UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, SignInFormData } from '@/schemas/sign-in-schema';
import { Logo } from '@components/logo';
import { TextField } from '@/components/ui/text-field';
import { Link } from '@ui/link';
import { Button } from '@ui/button';
import { Loader } from '@ui/loader';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { signIn } from '@/app/(auth)/sign-in/action';
import { useState } from 'react';
import { Note } from '@ui/note';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@ui/tooltip';
import { IconEyeOff, IconEye } from 'justd-icons';

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<Array<string>>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { mutate, status } = useMutation({
    mutationKey: ['signIn'],
    mutationFn: async (data: SignInFormData) => {
      const res = await signIn(data);

      if (res.errors) {
        setError(res.errors);
        throw new Error(res.errors[0]);
      }

      return res;
    },

    onSuccess: data => {
      toast.success(data.message);
      router.push('/dashboard');
    },
  });
  const isSigningIn = status === 'pending';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    mutate(data);
  };

  function fillTestDetails({ setValue }: { setValue: UseFormSetValue<SignInFormData> }) {
    setValue('email', 'sa@c.com')
    setValue('password', 'sa@c.com')
  }

  return (
    <div className="flex items-center justify-center min-h-svh px-4">
      <div className="w-full max-w-[24rem]">
        <Logo className="h-12 w-auto" />
        <h1 className="text-2xl font-bold text-fg mt-4">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-muted-fg">
          Not a member?{' '}
          <Link className="font-medium" intent="primary" href="/sign-up">
            Create a new account
          </Link>
        </p>
        {error.length > 0 && (
          <div>
            {error.map((errorMessage, index) => (
              <Note key={index} intent="danger">
                {errorMessage}
              </Note>
            ))}
          </div>
        )}
        <form
          method="POST"
          onSubmit={handleSubmit(onSubmit)}
          className={cn('mt-8', error.length > 0 && 'mt-4')}
        >
          <div className="space-y-4">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email address"
                  type="email"
                  autoComplete="new-email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
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
                />
              )}
            />
          </div>

          <div className="mt-6 space-y-4">
            <Button
              size="small"
              type="submit"
              className={cn(
                'relative w-full overflow-hidden',
                isSigningIn && 'pointer-events-none'
              )}
            >
              {isSigningIn ? (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader variant="spin" />
                </motion.div>
              ) : (
                'Sign in'
              )}
            </Button>
            <Button
              size="small"
              type="button"
              appearance="outline"
              className="w-full"
              onPress={() => fillTestDetails({ setValue })}
            >
              Fill Test Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
