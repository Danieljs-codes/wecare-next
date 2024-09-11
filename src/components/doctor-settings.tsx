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

export const DoctorSettings = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

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
        <TextField label="First Name" placeholder="Enter your first name" />
        <TextField label="Last Name" placeholder="Enter your last name" />
      </div>
      <Separator className="my-5" />
      <div className="space-y-5">
        <TextField label="Email" placeholder="Enter your email address" />
        <NumberField
          label="Price"
          placeholder="Enter your price"
          formatOptions={{
            style: 'currency',
            currency: 'USD',
          }}
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
            src="https://i.pravatar.cc/150?u=PR83Cabw0pxOU8_g5m7iU"
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
        <Select placeholder="Select a specialization" label="Specialization">
          <Select.Trigger />
          <Select.List
            items={doctorStep2Schema.shape.specialization.options.map(item => ({
              id: item,
              name: item,
            }))}
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
        <Textarea
          className="mt-2"
          placeholder="Write a short introduction"
          rows={5}
        />
      </div>
    </div>
  );
};
