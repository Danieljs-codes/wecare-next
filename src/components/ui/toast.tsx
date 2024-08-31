import { buttonStyles } from './button';
import { Loader } from './loader';
import {
  IconCheck,
  IconCircleInfoFill,
  IconTriangleInfoFill,
} from 'justd-icons';
import { Toaster as ToasterPrimitive, type ToasterProps } from 'sonner';
import { twJoin } from 'tailwind-merge';

const Toast = ({ ...props }: ToasterProps) => {
  const theme = 'light';
  return (
    <ToasterPrimitive
      theme={theme}
      className="toaster group"
      icons={{
        info: <IconCircleInfoFill />,
        success: <IconCheck />,
        warning: <IconTriangleInfoFill />,
        error: <IconTriangleInfoFill />,
        loading: <Loader variant="spin" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: twJoin(
            'overflow-hidden rounded-xl bg-bg px-4 py-3 font-sans text-[0.8125rem] font-normal text-fg ring-1 ring-border backdrop-blur-xl dark:ring-inset sm:min-w-[22rem] sm:px-5 sm:py-5',
            '[&:has([data-icon])_[data-content]]:ml-5',
            '[&:has([data-button])_[data-close-button="true"]]:hidden',
            '[&:not([data-description])_[data-title]]:font-normal',
            '[&:has([data-description])_[data-title]]:!text-lg [&:has([data-description])_[data-title]]:!font-medium',
            '[&>[data-button=true]]:bottom-4 [&>[data-button]]:absolute',
            '[&>[data-action=true]]:right-4',
            '[&>[data-cancel=true]]:left-4',
          ),
          icon: 'absolute top-[1rem] sm:top-[1.50rem]',
          content:
            '[&:not(:has(+button))]:pr-10 [&:has(+button)]:pb-11 md:[&:has(+button)]:pb-9',
          error:
            'bg-danger ring-danger-fg/10 text-white ring-inset [&>[data-close-button=true]>svg]:text-white [&>[data-close-button=true]:hover]:bg-white/20',
          info: 'bg-info ring-info-fg/10 text-info-fg ring-inset [&>[data-close-button=true]>svg]:text-info-fg [&>[data-close-button=true]:hover]:bg-white/20',
          warning:
            'bg-warning text-warning-fg ring-warning-fg/10 ring-inset [&>[data-close-button=true]>svg]:text-amber-950 [&>[data-close-button=true]:hover]:bg-white/20',
          success:
            'bg-primary-600 ring-primary-700/50 text-white ring-inset [&>[data-close-button=true]>svg]:text-white [&>[data-close-button=true]:hover]:bg-white/20',
          cancelButton: buttonStyles({
            className: '',
            size: 'extra-small',
            appearance: 'outline',
          }),
          actionButton: buttonStyles({
            className: 'self-end justify-self-end',
            size: 'extra-small',
          }),
          closeButton:
            '[&_svg]:size-5 size-8 absolute top-1/2 transform -translate-y-1/2 right-2 lg:right-3 left-auto grid place-content-center rounded-md hover:bg-black/20 dark:hover:bg-white/20 border-0 [&_svg]:text-fg',
        },
      }}
      {...props}
    />
  );
};

export { Toast };
