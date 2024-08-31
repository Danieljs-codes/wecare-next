'use client';

import { DateInput } from './date-field';
import { Description, FieldError, fieldGroupStyles, Label } from './field';
import { ctr } from './primitive';
import { AnimatePresence, motion } from 'framer-motion';
import React, { forwardRef } from 'react';
import {
  TimeField as TimeFieldPrimitive,
  type TimeFieldProps as TimeFieldPrimitiveProps,
  type TimeValue,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

export interface TimeFieldProps<T extends TimeValue>
  extends TimeFieldPrimitiveProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

const timeFieldStyles = tv({
  extend: fieldGroupStyles,
  base: 'flex w-fit font-mono min-w-28 justify-around whitespace-nowrap p-2 lg:text-sm',
});

const TimeField = forwardRef<HTMLDivElement, TimeFieldProps<TimeValue>>(
  function TimeField(
    { label, className, description, errorMessage, ...props },
    ref,
  ) {
    return (
      <TimeFieldPrimitive
        {...props}
        ref={ref}
        className={ctr(className, 'flex flex-col gap-1')}
      >
        <Label>{label}</Label>
        <DateInput className={timeFieldStyles} />
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
      </TimeFieldPrimitive>
    );
  },
);

export { TimeField };
