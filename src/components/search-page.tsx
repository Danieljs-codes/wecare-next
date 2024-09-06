'use client';

import { Button } from '@ui/button';
import { Menu } from '@ui/menu';
import { useMediaQuery } from '@ui/primitive';
import { SearchField } from '@ui/search-field';
import { IconChevronDown, IconFilter } from 'justd-icons';
import { useState } from 'react';
import { Selection } from 'react-aria-components';

const sortOptions = [
  {
    id: 'yearsOfExperience',
    name: 'Years of Experience',
  },
  {
    id: 'highestRated',
    name: 'Highest Rated',
  },
  {
    id: 'availability',
    name: 'Availability',
  },
  {
    id: 'specialization',
    name: 'Specialization',
  },
  {
    id: 'distance',
    name: 'Distance',
  },
];

export const SearchPage = () => {
  const isMobile = useMediaQuery('(max-width: 450px)');
  const [selected, setSelected] = useState<Selection>(new Set([]));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
          aria-label="Search Doctor by name"
          placeholder="Enter doctor's name"
          className="flex-1"
        />
        <Button size="medium" className="text-sm">
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
    </div>
  );
};
