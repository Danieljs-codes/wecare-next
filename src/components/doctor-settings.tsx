'use client';

import { Avatar } from '@ui/avatar';
import { Button, buttonStyles } from '@ui/button';
import {
  isFileDropItem,
  Button as ReactAriaButton,
} from 'react-aria-components';
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
import { countries } from '@lib/processed-countries';
import { useState } from 'react';
import { Textarea } from '@ui/textarea';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DropEvent } from '@react-types/shared';
import { useMutation } from '@tanstack/react-query';
import { updateDoctorSettings } from '@/app/(main)/doctor/settings/action';
import { toast } from 'sonner';
import { doctorSettingsSchema } from '@/schemas/new-appointment';

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
  country: string | null;
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


type DoctorSettingsFormData = z.infer<typeof doctorSettingsSchema>;

export const DoctorSettings = ({ doctorInfo }: DoctorSettingsProps) => {
  const [image, setImage] = useState<string>(doctorInfo.user.avatar);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorSettingsFormData>({
    resolver: zodResolver(doctorSettingsSchema),
    defaultValues: {
      firstName: doctorInfo.user.firstName,
      lastName: doctorInfo.user.lastName,
      email: doctorInfo.user.email,
      price: doctorInfo.price / 100,
      specialization: doctorInfo.specialization,
      country: doctorInfo.country ?? '',
      timezone: doctorInfo.timezone,
      bio: doctorInfo.bio,
    },
  });
  const { mutateAsync } = useMutation({
    mutationKey: ['updateDoctorSettings'],
    mutationFn: async (data: DoctorSettingsFormData) => {
      const res = await updateDoctorSettings({
        ...data,
        image: base64Image ?? undefined,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      return res;
    },
  });

  // Convert countries object to an array
  const countryList = Object.values(countries);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onDropHandler = async (e: DropEvent) => {
    const item = e.items
      .filter(isFileDropItem)
      .find(item => item.type === 'image/jpeg' || item.type === 'image/png');
    if (item) {
      const file = await item.getFile();
      setImage(URL.createObjectURL(file));
      const base64 = await convertToBase64(file);
      setBase64Image(base64);
    }
  };

  const onSelectHandler = async (e: any) => {
    if (e) {
      const files = Array.from([...e]);
      const item = files[0];

      if (item) {
        setImage(URL.createObjectURL(item));
        const base64 = await convertToBase64(item);
        setBase64Image(base64);
      }
    }
  };

  const onSubmit = async (data: DoctorSettingsFormData) => {
    console.log(data);
    toast.promise(mutateAsync(data), {
      loading: 'Saving...',
      success: data => {
        return `${data.message}`;
      },
      error: (error: Error) => `${error.message}`,
    });
  };


  return (
    <div>
      <form method='POST' onSubmit={handleSubmit(onSubmit)}>
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
            <Button
              onPress={() => {
                reset();
                setImage(doctorInfo.user.avatar);
                setBase64Image(null);
              }}
              type="button"
              size="small"
              intent="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" size="small">
              Save
            </Button>
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
                <Tooltip delay={500}>
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
            <Avatar src={image} initials="PR" className="size-16 mb-5" />
            <DropZone
              className="border-solid"
              getDropOperation={types =>
                types.has('image/jpeg') || types.has('image/png')
                  ? 'copy'
                  : 'cancel'
              }
              onDrop={onDropHandler}
            >
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
                    onSelect={onSelectHandler}
                  >
                    <ReactAriaButton className="text-sm font-semibold text-primary focus:outline-none">
                      Click to upload
                    </ReactAriaButton>
                  </FileTrigger>
                  <span className="text-sm text-muted-fg">
                    or drag and drop
                  </span>
                </div>
                <p className="text-xs text-muted-fg mt-1">
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>
              </div>
              <input type="hidden" name="image" value={image} />
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
          <Controller
            name="country"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <ComboBox
                label="Country"
                placeholder="Select your country"
                selectedKey={value}
                onSelectionChange={selected => {
                  const country = countryList.find(c => c.name === selected);
                  onChange(selected);
                }}
                {...field}
                isInvalid={!!errors.country}
                errorMessage={errors.country?.message}
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
            )}
          />
        </div>
        <Separator className="my-5" />
        <div>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <TextField
                label="Timezone"
                isReadOnly
                description="This is automatically set based on your location. You can change it if needed."
                descriptionClassName="text-xs text-muted-fg"
                {...field}
              />
            )}
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
      </form>
    </div>
  );
};
