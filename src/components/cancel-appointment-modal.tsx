import { useRouter } from 'next/navigation';
import { Modal } from '@ui/modal';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SubmitButton } from '@ui/submit-button';
import { cancelAppointment } from '@/actions/cancel-appointment';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appointmentId: string;
}

export function CancelAppointmentModal({
  isOpen,
  onOpenChange,
  appointmentId,
}: CancelAppointmentModalProps) {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationKey: ['cancelAppointment'],
    mutationFn: async (appointmentId: string) => {
      const res = await cancelAppointment(appointmentId);

      if (!res.success) {
        throw new Error(res.error);
      }

      return res;
    },

    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      router.push('/patient/appointments');
      onOpenChange(false);
    },

    onError: error => {
      toast.error(error.message);
      console.error('Error cancelling appointment:', error);
    },
  });

  const handleCancel = () => {
    mutate(appointmentId);
  };

  return (
    <Modal>
      <Modal.Content
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isBlurred
        role="alertdialog"
      >
        <Modal.Header>
          <Modal.Title>Cancel Appointment</Modal.Title>
          <Modal.Description className="text-xs sm:text-sm">
            Are you sure you want to cancel this appointment? Please note that
            cancelling an appointment will result in a refund of only 50% of
            your fees. This action cannot be undone once confirmed. If you need
            to reschedule instead, please use the reschedule option. Consider
            your decision carefully before proceeding.
          </Modal.Description>
          <Modal.Footer className="pb-2 sm:pb-4">
            <Modal.Close onPress={() => onOpenChange(false)} size="small">
              Close
            </Modal.Close>
            <SubmitButton
              intent="danger"
              onPress={handleCancel}
              size="small"
              isLoading={isPending}
              className="mt-0"
            >
              Cancel Appointment
            </SubmitButton>
          </Modal.Footer>
        </Modal.Header>
      </Modal.Content>
    </Modal>
  );
}
