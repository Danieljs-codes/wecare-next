import { Button, ButtonProps } from '@/components/ui/button';
import { Loader } from '@ui/loader';
import { cn } from '@lib/utils';
import { motion } from 'framer-motion';

interface SubmitButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
} 

export function SubmitButton({
  isLoading,
  loadingText = 'Loading',
  children,
  className,
  ...rest
}: SubmitButtonProps) {
  return (
    <Button
      size="small"
      type="submit"
      className={cn(
        'relative mt-6 w-full overflow-hidden',
        isLoading && 'pointer-events-none',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader variant="spin" />
          <span className="sr-only">{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </Button>
  );
}
