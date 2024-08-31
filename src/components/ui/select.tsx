'use client';

import { DropdownItem, DropdownItemDetails, DropdownSection } from './dropdown';
import { Description, FieldError, Label } from './field';
import { ListBox } from './list-box';
import { Popover } from './popover';
import { cr, ctr, focusStyles } from './primitive';
import type { Placement } from '@react-types/overlays';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { IconChevronLgDown } from 'justd-icons';
import * as React from 'react';
import { forwardRef } from 'react';
import type { ButtonProps } from 'react-aria-components';
import {
  Button,
  Select as SelectPrimitive,
  type SelectProps as SelectPrimitiveProps,
  SelectValue,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

const selectTriggerStyles = tv({
  extend: focusStyles,
  base: [
    'btr group-disabled:bg-secondary [&_[data-slot=icon]]:size-4 group-disabled:opacity-50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 group-open:border-primary group-open:ring-4 group-open:ring-primary/20 flex h-10 w-full cursor-default items-center gap-4 rounded-lg border border-input bg-bg py-2 pl-3 pr-2 text-start shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition dark:shadow-none',
  ],
  variants: {
    isDisabled: {
      false:
        'text-fg group-invalid:border-danger group-invalid:ring-danger/20 forced-colors:group-invalid:border-[Mark]',
      true: 'bg-secondary text-muted-fg forced-colors:border-[GrayText] forced-colors:text-[GrayText]',
    },
  },
});

interface SelectProps<T extends object> extends SelectPrimitiveProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  className?: string;
}

const Select = forwardRef(
  <T extends object>(
    {
      label,
      description,
      errorMessage,
      children,
      className,
      ...props
    }: SelectProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    return (
      <SelectPrimitive
        {...props}
        ref={ref}
        className={ctr(className, 'group flex w-full flex-col gap-1')}
      >
        {label && <Label>{label}</Label>}
        <>{children}</>
        {description && <Description>{description}</Description>}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
            >
              <FieldError>{errorMessage}</FieldError>
            </motion.div>
          )}
        </AnimatePresence>
      </SelectPrimitive>
    );
  },
);

Select.displayName = 'Select';

interface ListProps<T extends object> {
  items?: Iterable<T>;
  placement?: Placement;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  className?: string;
}

const List = <T extends object>({
  className,
  children,
  items,
  placement,
}: ListProps<T>) => {
  return (
    <Popover.Picker
      className={className}
      trigger="Select"
      placement={placement}
    >
      <ListBox.Picker aria-label="items" items={items}>
        {children}
      </ListBox.Picker>
    </Popover.Picker>
  );
};

interface TriggerProps extends ButtonProps {
  prefix?: React.ReactNode;
  className?: string;
}

const Trigger = ({ className, ...props }: TriggerProps) => {
  return (
    <Button
      className={cr(className, (className, renderProps) =>
        selectTriggerStyles({
          ...renderProps,
          className,
        }),
      )}
    >
      {props.prefix && <span className="-mr-1">{props.prefix}</span>}
      <SelectValue className="flex-1 text-sm placeholder-shown:text-muted-fg lg:text-sm [&_[slot=description]]:hidden" />
      <IconChevronLgDown
        aria-hidden
        className="size-4 shrink-0 text-muted-fg duration-300 group-open:rotate-180 group-open:text-fg group-disabled:opacity-50 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
      />
    </Button>
  );
};

const SelectWithComponents = Select as typeof Select & {
  OptionDetails: typeof DropdownItemDetails;
  Option: typeof DropdownItem;
  Section: typeof DropdownSection;
  Trigger: typeof Trigger;
  List: typeof List;
};

SelectWithComponents.OptionDetails = DropdownItemDetails;
SelectWithComponents.Option = DropdownItem;
SelectWithComponents.Section = DropdownSection;
SelectWithComponents.Trigger = Trigger;
SelectWithComponents.List = List;

export { SelectWithComponents as Select };
