import { rescheduleAppointment } from '@/app/(main)/patient/appointments/action';
import {
  RescheduleAppointmentSchema,
  rescheduleAppointmentSchema,
} from '@/schemas/new-appointment';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getLocalTimeZone,
  now,
  parseZonedDateTime,
  today,
} from '@internationalized/date';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@ui/button';
import { DatePicker } from '@ui/date-picker';
import { Modal } from '@ui/modal';
import { Note } from '@ui/note';
import { SubmitButton } from '@ui/submit-button';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appointmentId: string;
  doctorId: string;
  currentAppointmentStart: string;
}

export const RescheduleAppointmentModal = ({
  isOpen,
  onOpenChange,
  appointmentId,
  doctorId,
  currentAppointmentStart,
}: RescheduleAppointmentModalProps) => {
  console.log(currentAppointmentStart);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    clearErrors,
  } = useForm<RescheduleAppointmentSchema>({
    resolver: zodResolver(rescheduleAppointmentSchema),
    defaultValues: {
      appointmentId,
      doctorId,
      appointmentStart: parseZonedDateTime(
        now(getLocalTimeZone())
          .add({ hours: 2 })
          .set({ minute: 0, second: 0, millisecond: 0 })
          .toString()
      ),
    },
  });

  const handleCloseModal = () => {
    onOpenChange(false);
    clearErrors();
  };

  const { mutate, status } = useMutation({
    mutationKey: ['rescheduleAppointment'],
    mutationFn: async (data: RescheduleAppointmentSchema) => {
      const { appointmentId, doctorId, appointmentStart } = data;
      const res = await rescheduleAppointment({
        appointmentId,
        doctorId,
        appointmentStart: DateTime.fromObject(
          {
            year: appointmentStart.year,
            month: appointmentStart.month,
            day: appointmentStart.day,
            hour: appointmentStart.hour,
            minute: appointmentStart.minute,
            second: appointmentStart.second,
            millisecond: 0,
          },
          { zone: appointmentStart.timeZone }
        )
          .toUTC()
          .toISO()!,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      return res;
    },
    onError: error => {
      setError('root', { type: 'manual', message: error.message });
    },
    onSuccess: () => {
      toast.success('Appointment rescheduled successfully');
      handleCloseModal();
      reset();
    },
  });

  const onSubmit = (data: RescheduleAppointmentSchema) => {
    mutate(data);
  };

  return (
    <Modal>
      <Modal.Content
        closeButton={false}
        isOpen={isOpen}
        onOpenChange={handleCloseModal}
      >
        <Modal.Header>
          <Modal.Title>Reschedule Appointment</Modal.Title>
          <Modal.Description className="text-xs sm:text-sm">
            Select a new date and time for your appointment.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <form
            id="rescheduleAppointmentForm"
            onSubmit={handleSubmit(onSubmit)}
          >
            {errors.root && <Note intent="danger">{errors.root.message}</Note>}
            <div className="flex flex-col gap-4">
              <Controller
                name="appointmentStart"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    minValue={today(getLocalTimeZone())}
                    label="Select New Date and Time"
                    hideTimeZone
                    hourCycle={12}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="flex-col">
          <Button appearance="outline" onPress={handleCloseModal} size="small">
            Cancel
          </Button>
          <SubmitButton
            intent="primary"
            size="small"
            form="rescheduleAppointmentForm"
            type="submit"
            className="sm:w-auto mt-0"
            isLoading={status === 'pending'}
          >
            Confirm Reschedule
          </SubmitButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
