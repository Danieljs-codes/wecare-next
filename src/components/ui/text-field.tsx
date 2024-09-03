'use client';

// Import motion components
import type { FieldProps } from './field';
import {
  Description,
  FieldError,
  FieldGroup,
  fieldGroupPrefixStyles,
  Input,
  Label,
} from './field';
import { ctr } from './primitive';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLoader } from 'justd-icons';
import * as React from 'react';
import {
  TextField as TextFieldPrimitive,
  type TextFieldProps as TextFieldPrimitiveProps,
} from 'react-aria-components';

interface TextFieldProps extends TextFieldPrimitiveProps, FieldProps {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  isLoading?: boolean;
  indicatorPlace?: 'prefix' | 'suffix';
  descriptionClassName?: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      placeholder,
      label,
      description,
      errorMessage,
      prefix,
      suffix,
      isLoading,
      indicatorPlace,
      descriptionClassName,
      ...props
    },
    ref
  ) => {
    return (
      <TextFieldPrimitive
        {...props}
        ref={ref}
        className={ctr(props.className, 'group flex flex-col gap-1')}
      >
        {label && <Label>{label}</Label>}
        <FieldGroup
          data-loading={isLoading ? 'true' : undefined}
          className={fieldGroupPrefixStyles()}
        >
          {isLoading && indicatorPlace === 'prefix' ? (
            <IconLoader className="isPfx animate-spin" />
          ) : prefix ? (
            <span className="atrs isPfx x2e2">{prefix}</span>
          ) : null}
          <Input className="px-2.5" placeholder={placeholder} />
          {isLoading && indicatorPlace === 'suffix' ? (
            <IconLoader className="isSfx animate-spin" />
          ) : suffix ? (
            <span className="atrs isSfx x2e2">{suffix}</span>
          ) : null}
        </FieldGroup>
        {description && (
          <Description className={descriptionClassName}>
            {description}
          </Description>
        )}
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
      </TextFieldPrimitive>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField, TextFieldPrimitive, type TextFieldProps };
