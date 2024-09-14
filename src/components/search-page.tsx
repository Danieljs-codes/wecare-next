'use client';

import { doctorStep2Schema } from '@/schemas/sign-up-schema';
import { Doctor } from '@lib/types';
import { Avatar } from '@ui/avatar';
import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import { Menu } from '@ui/menu';
import { NumberField } from '@ui/number-field';
import { useMediaQuery } from '@ui/primitive';
import { SearchField } from '@ui/search-field';
import { Select } from '@ui/select';
import { Sheet } from '@ui/sheet';
import { TimeField } from '@ui/time-field';
import { IconChevronDown, IconFilter, IconX } from 'justd-icons';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Selection } from 'react-aria-components';
import { Time } from '@internationalized/date';
import { parseAsInteger, useQueryState } from 'nuqs';
import { TimeValue } from '@react-types/datepicker';
import { convertCentsToDollars, getUserTimezone } from '@lib/utils';
import { Link } from '@ui/link';

const sortOptions = [
  { id: 'yearsOfExperience', name: 'Years of Experience' },
  { id: 'highestRated', name: 'Highest Rated' },
  { id: 'availability', name: 'Availability' },
  { id: 'specialization', name: 'Specialization' },
  { id: 'distance', name: 'Distance' },
];

export function SearchPage({ doctors }: { doctors: Doctor[] }) {
  const isMobile = useMediaQuery('(max-width: 450px)');
  const [selected, setSelected] = useState<Selection>(new Set([]));
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter state
  const [name, setName] = useQueryState('name', {
    shallow: false,
  });
  const [specialization, setSpecialization] = useQueryState('specialization', {
    shallow: false,
  });
  const [minExperience, setMinExperience] = useQueryState(
    'minExperience',
    parseAsInteger.withOptions({
      shallow: false,
    })
  );
  const [maxExperience, setMaxExperience] = useQueryState(
    'maxExperience',
    parseAsInteger.withOptions({
      shallow: false,
    })
  );
  const [startTime, setStartTime] = useQueryState('startTime', {
    shallow: false,
  });
  const [endTime, setEndTime] = useQueryState('endTime', {
    shallow: false,
  });
  const [timezone, setTimezone] = useQueryState('timezone', {
    shallow: false,
  });

  // Local state for filter values
  const [localName, setLocalName] = useState(name || '');
  const [localSpecialization, setLocalSpecialization] = useState(
    specialization || 'all'
  );
  const [localMinExperience, setLocalMinExperience] = useState(
    minExperience ? minExperience : undefined
  );
  const [localMaxExperience, setLocalMaxExperience] = useState(
    maxExperience ? maxExperience : undefined
  );
  const [localStartTime, setLocalStartTime] = useState<Time | null>(
    startTime
      ? new Time(
          parseInt(startTime.split(':')[0]),
          parseInt(startTime.split(':')[1])
        )
      : null
  );
  const [localEndTime, setLocalEndTime] = useState<Time | null>(
    endTime
      ? new Time(
          parseInt(endTime.split(':')[0]),
          parseInt(endTime.split(':')[1])
        )
      : null
  );

  const applyFilters = () => {
    setSpecialization(localSpecialization);
    setMinExperience(localMinExperience ?? null);
    setMaxExperience(localMaxExperience ?? null);
    setStartTime(
      localStartTime
        ? `${localStartTime.hour
            .toString()
            .padStart(2, '0')}:${localStartTime.minute
            .toString()
            .padStart(2, '0')}`
        : null
    );
    setEndTime(
      localEndTime
        ? `${localEndTime.hour
            .toString()
            .padStart(2, '0')}:${localEndTime.minute
            .toString()
            .padStart(2, '0')}`
        : null
    );
    setTimezone(getUserTimezone());
    setIsSheetOpen(false);
  };

  return (
    <div>
      <div>
        <h1 className="font-semibold text-xl mb-2">Find Your Ideal Doctor</h1>
        <p className="text-xs md:text-sm text-muted-fg text-pretty">
          Search and connect with top-rated healthcare professionals tailored to
          your needs.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-x-2">
        <SearchField
          value={localName}
          onChange={name => setLocalName(name)}
          aria-label="Search Doctor by name"
          placeholder="Enter doctor's name"
          className="flex-1"
          onClear={() => setName('')}
        />
        <Button
          onPress={() => setName(localName)}
          size="medium"
          className="text-sm"
        >
          {isMobile ? 'Search' : 'Find Doctor'}
        </Button>
      </div>
      <div className="flex justify-end mt-4 gap-x-2">
        <Menu aria-label="Sort">
          <Button size="small" appearance="plain">
            Sort
            <IconChevronDown />
          </Button>
          <Menu.Content
            placement="bottom right"
            respectScreen={false}
            selectionMode="single"
            items={sortOptions}
            className="min-w-48"
            selectedKeys={selected}
            onSelectionChange={setSelected}
            aria-label="Sort"
          >
            {item => (
              <Menu.Checkbox id={item.id} textValue={item.name}>
                {item.name}
              </Menu.Checkbox>
            )}
          </Menu.Content>
        </Menu>
        <Button
          onPress={() => setIsSheetOpen(true)}
          size="square-petite"
          appearance="outline"
        >
          <IconFilter />
        </Button>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {doctors.map(doctor => (
            <Card key={doctor.doctorId} className="p-4 flex flex-col">
              <div className="flex items-center gap-x-4 mb-4">
                <Avatar
                  src={doctor.avatar}
                  initials={`${doctor.firstName[0]}${doctor.lastName[0]}`}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  size="large"
                />
                <div>
                  <h3 className="font-semibold text-base capitalize">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-[13px] text-muted-fg capitalize">
                    {doctor.specialization}
                  </p>
                </div>
              </div>
              <div className="text-sm mb-3">
                <p className="text-xs sm:text-sm text-muted-fg">
                  Years of Experience:
                </p>
                <span className="font-medium">
                  {doctor.yearsOfExperience} years
                </span>
              </div>
              <div className="text-sm mb-3">
                <p className="text-xs sm:text-sm text-muted-fg">Price</p>
                <span className="font-medium">
                  ${convertCentsToDollars(doctor.price)}/hour
                </span>
              </div>
              <div className="text-sm">
                <p className="text-xs sm:text-sm text-muted-fg">Available:</p>
                <span className="font-medium">
                  {DateTime.fromISO(doctor.startTime)
                    .setZone('local')
                    .toLocaleString(DateTime.TIME_SIMPLE)}{' '}
                  -{' '}
                  {DateTime.fromISO(doctor.endTime)
                    .setZone('local')
                    .toLocaleString(DateTime.TIME_SIMPLE)}
                </span>
              </div>
              <Link
                className={buttonStyles({
                  size: 'small',
                  intent: 'primary',
                  className: 'mt-4',
                })}
                href={`/patient/search/${doctor.doctorId}`}
              >
                View Profile
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <Sheet>
          <Sheet.Content
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            side="right"
            isStack={false}
            closeButton={false}
          >
            <Sheet.Header>
              <div className="flex items-center justify-between">
                <Sheet.Title>Filters</Sheet.Title>
                <Button
                  onPress={() => setIsSheetOpen(false)}
                  size="square-petite"
                  appearance="plain"
                >
                  <IconX />
                </Button>
              </div>
            </Sheet.Header>
            <Sheet.Body>
              <div className="space-y-4">
                <Select
                  label="Specialization"
                  placeholder="Select specialization"
                  selectedKey={localSpecialization}
                  onSelectionChange={value =>
                    setLocalSpecialization(value as string)
                  }
                >
                  <Select.Trigger />
                  <Select.List
                    items={[
                      { id: 'all', name: 'All' },
                      ...doctorStep2Schema.shape.specialization.options.map(
                        item => ({ id: item, name: item })
                      ),
                    ]}
                  >
                    {item => (
                      <Select.Option id={item.id} textValue={item.name}>
                        {item.name}
                      </Select.Option>
                    )}
                  </Select.List>
                </Select>
                <NumberField
                  label="Minimum Years of Experience"
                  placeholder="Enter minimum years"
                  minValue={1}
                  step={1}
                  value={localMinExperience}
                  onChange={setLocalMinExperience}
                />
                <NumberField
                  label="Maximum Years of Experience"
                  placeholder="Enter maximum years"
                  minValue={1}
                  step={1}
                  value={localMaxExperience}
                  onChange={setLocalMaxExperience}
                />
                <div className="flex gap-x-3">
                  <TimeField
                    label="Start Time"
                    value={localStartTime}
                    onChange={(value: TimeValue) =>
                      setLocalStartTime(value as Time)
                    }
                  />
                  <TimeField
                    label="End Time"
                    value={localEndTime}
                    onChange={(value: TimeValue) =>
                      setLocalEndTime(value as Time)
                    }
                  />
                </div>
              </div>
            </Sheet.Body>
            <Sheet.Footer className="border-t border-border">
              <div className="flex items-center gap-x-2 w-full">
                <Sheet.Close className={'flex-1'} size="small">
                  Close
                </Sheet.Close>
                <Button
                  className={'flex-1'}
                  size="small"
                  onPress={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet>
      </div>
    </div>
  );
}
