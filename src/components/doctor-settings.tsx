'use client';

import { Avatar } from '@ui/avatar';
import { Button, buttonStyles } from '@ui/button';
import { Button as ReactAriaButton } from 'react-aria-components';
import { DropZone } from '@ui/drop-zone';
import { NumberField } from '@ui/number-field';
import { Separator } from '@ui/separator';
import { TextField } from '@ui/text-field';
import { Tooltip } from '@ui/tooltip';
import { IconCircleQuestionmark, IconCloudDownload } from 'justd-icons';
import { FileTrigger } from 'react-aria-components';
import { Select } from '@ui/select';
import { doctorStep2Schema } from '@/schemas/sign-up-schema';
import { ComboBox } from '@ui/combo-box';
import { countries, Country } from '@lib/processed-countries';
import { useState } from 'react';
import { getUserTimezone } from '@lib/utils';
import { Textarea } from '@ui/textarea';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface DoctorInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  specialization: string;
  yearsOfExperience: number;
  startTime: string;
  endTime: string;
  timezone: string;
  bio: string;
  price: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: 'patient' | 'doctor';
    email: string;
    password: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface DoctorSettingsProps {
  doctorInfo: DoctorInfo;
}

const doctorSettingsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  price: z.number().positive('Price must be positive'),
  specialization: z.string().min(1, 'Specialization is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type DoctorSettingsFormData = z.infer<typeof doctorSettingsSchema>;

export const DoctorSettings = ({ doctorInfo }: DoctorSettingsProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorSettingsFormData>({
    resolver: zodResolver(doctorSettingsSchema),
    defaultValues: {
      firstName: doctorInfo.user.firstName,
      lastName: doctorInfo.user.lastName,
      email: doctorInfo.user.email,
      price: doctorInfo.price / 100,
      specialization: doctorInfo.specialization,
      country: '', // We'll need to set this based on the timezone
      timezone: doctorInfo.timezone,
      bio: doctorInfo.bio,
    },
  });

  // Convert countries object to an array
  const countryList = Object.values(countries);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-fg mb-1">Settings</h1>
        <p className="text-sm text-muted-fg">Manage your account settings.</p>
        <Separator className="mt-4" />
      </div>
      <div className="pt-8">
        <h2 className="text-lg font-semibold">Personal Info</h2>
        <p className="text-sm text-muted-fg">
          Update your photo and personal details here.
        </p>
        <div className="flex items-center gap-x-2 mt-4">
          <Button size="small" intent="secondary">
            Cancel
          </Button>
          <Button size="small">Save</Button>
        </div>
      </div>
      <Separator className="mt-5 my-4" />
      <div className="space-y-5">
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              label="First Name"
              placeholder="Enter your first name"
              {...field}
              isInvalid={!!errors.firstName}
              errorMessage={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              label="Last Name"
              placeholder="Enter your last name"
              {...field}
              isInvalid={!!errors.lastName}
              errorMessage={errors.lastName?.message}
            />
          )}
        />
      </div>
      <Separator className="my-5" />
      <div className="space-y-5">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              label="Email"
              placeholder="Enter your email address"
              {...field}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <NumberField
              label="Price"
              placeholder="Enter your price"
              formatOptions={{
                style: 'currency',
                currency: 'USD',
              }}
              {...field}
              isInvalid={!!errors.price}
              errorMessage={errors.price?.message}
            />
          )}
        />
      </div>
      <Separator className="my-5" />
      <div>
        <div className="mb-5">
          {/* Text and Tooltip */}
          <div className="flex items-center gap-x-0.5">
            <h3 className="text-sm font-semibold">Your Photo </h3>
            <div className="mt-1">
              <Tooltip>
                <Tooltip.Trigger className={'text-muted-fg'}>
                  <IconCircleQuestionmark />
                </Tooltip.Trigger>
                <Tooltip.Content className="text-xs">
                  Change your photo
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
          <p className="text-sm text-muted-fg">
            This will be displayed on your profile.
          </p>
        </div>
        <div>
          <Avatar
            src={doctorInfo.user.avatar}
            initials="PR"
            className="size-16 mb-5"
          />
          <DropZone className="border-solid">
            <div className="py-4 px-6 flex flex-col justify-center items-center">
              <div
                className={buttonStyles({
                  size: 'square-petite',
                  intent: 'secondary',
                  className: 'mb-3',
                })}
              >
                <IconCloudDownload />
              </div>
              <div className="flex items-center gap-x-1">
                <FileTrigger
                  acceptedFileTypes={['image/png', 'image/jpeg']}
                  allowsMultiple={false}
                >
                  <ReactAriaButton className="text-sm font-semibold text-primary focus:outline-none">
                    Click to upload
                  </ReactAriaButton>
                </FileTrigger>
                <span className="text-sm text-muted-fg">or drag and drop</span>
              </div>
              <p className="text-xs text-muted-fg mt-1">
                SVG, PNG, JPG or GIF (max. 800x400px)
              </p>
            </div>
          </DropZone>
        </div>
      </div>
      <Separator className="my-5" />
      <div>
        <Controller
          name="specialization"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <Select
              placeholder="Select a specialization"
              label="Specialization"
              selectedKey={value}
              onSelectionChange={onChange}
              {...field}
            >
              <Select.Trigger />
              <Select.List
                items={doctorStep2Schema.shape.specialization.options.map(
                  item => ({
                    id: item,
                    name: item,
                  })
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
      </div>
      <Separator className="my-5" />
      <div>
        <ComboBox
          label="Country"
          placeholder="Select your country"
          selectedKey={selectedCountry?.name}
          onSelectionChange={selected => {
            const country = countryList.find(c => c.name === selected);
            setSelectedCountry(country || null);
          }}
        >
          <ComboBox.Input />
          <ComboBox.List items={countryList}>
            {item => (
              <ComboBox.Option id={item.name} textValue={item.name}>
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.flag}
                    alt={`${item.name} flag`}
                    className="w-4"
                  />
                  {item.name}
                </div>
              </ComboBox.Option>
            )}
          </ComboBox.List>
        </ComboBox>
      </div>
      <Separator className="my-5" />
      <div>
        <TextField
          label="Timezone"
          value={getUserTimezone()}
          isReadOnly
          description="This is automatically set based on your location. You can change it if needed."
          descriptionClassName="text-xs text-muted-fg"
        />
      </div>
      <Separator className="my-5" />
      <div>
        <h3 className="text-sm font-semibold">Bio</h3>
        <p className="text-sm text-muted-fg">Write a short introduction</p>
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <Textarea
              className="mt-2"
              placeholder="Write a short introduction"
              rows={3}
              {...field}
              isInvalid={!!errors.bio}
              errorMessage={errors.bio?.message}
            />
          )}
        />
      </div>
    </div>
  );
};
