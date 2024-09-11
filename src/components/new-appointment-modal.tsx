import { createAppointmentByDoctor } from '@/app/(main)/doctor/patients/action';
import {
  NewAppointmentSchema,
  newAppointmentSchema,
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
import { Select } from '@ui/select';
import { SubmitButton } from '@ui/submit-button';
import { TextField } from '@ui/text-field';
import { TimeField } from '@ui/time-field';
import { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NewAppointmentModal({
  isOpen,
  onOpenChange,
}: NewAppointmentModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm<NewAppointmentSchema>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      reasonForAppointment: '',
      patientId: '',
      appointmentDuration: undefined,
      appointmentDateTime: parseZonedDateTime(
        now(getLocalTimeZone())
          .add({ hours: 2 })
          .set({ minute: 0, second: 0, millisecond: 0 })
          .toString()
      ),
    },
  });

  useEffect(() => {
    if (!isOpen) {
      clearErrors();
      reset();
    }
  }, [isOpen, clearErrors, reset]);

  const { mutate, status } = useMutation({
    mutationKey: ['createAppointment'],
    mutationFn: async (data: NewAppointmentSchema) => {
      const res = await createAppointmentByDoctor({
        reasonForAppointment: data.reasonForAppointment,
        appointmentDuration: data.appointmentDuration,
        patientId: data.patientId,
        appointmentDateTime: {
          year: data.appointmentDateTime.year,
          month: data.appointmentDateTime.month,
          day: data.appointmentDateTime.day,
          hour: data.appointmentDateTime.hour,
          minute: data.appointmentDateTime.minute,
          second: data.appointmentDateTime.second,
          millisecond: data.appointmentDateTime.millisecond,
          timeZone: data.appointmentDateTime.timeZone,
        },
      });

      if (res.error && typeof res.error === 'string') {
        setError('root', { type: 'manual', message: res.error });
        throw new Error(res.error);
      }

      return res;
    },
    onSuccess: data => {
      toast.success(data.message);
      onOpenChange(false);
      reset();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const onSubmit: SubmitHandler<NewAppointmentSchema> = data => {
    clearErrors();
    console.log('Appointment data:', data);
    mutate(data);
  };

  return (
    <div>
      <Modal>
        <Modal.Content
          closeButton={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isBlurred
        >
          <Modal.Header>
            <Modal.Title>Schedule New Appointment</Modal.Title>
            <Modal.Description className="text-xs sm:text-sm">
              Book your next appointment quickly and easily. Choose a date,
              time, and service that works best for you.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <form method='POST' id="bookAppointmentForm" onSubmit={handleSubmit(onSubmit)}>
              {errors.root && (
                <Note intent="danger">{errors.root.message}</Note>
              )}
              <div className="flex flex-col gap-4">
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      label="Patient ID"
                      description="A 6-digit number used for identifying patients"
                      descriptionClassName="text-xs sm:text-sm"
                      {...field}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    />
                  )}
                />
                <Controller
                  name="appointmentDateTime"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      // minValue={today(getLocalTimeZone())}
                      label="Appointment Date"
                      hideTimeZone
                      hourCycle={12}
                      value={value}
                      onChange={val => {
                        console.log(val);
                        onChange(val);
                      }}
                    />
                  )}
                />
                <Controller
                  name="appointmentDuration"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      placeholder="Select duration"
                      label="Appointment Duration"
                      {...field}
                      onSelectionChange={field.onChange}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    >
                      <Select.Trigger />
                      <Select.List
                        className="text-sm"
                        items={newAppointmentSchema.shape.appointmentDuration.options.map(
                          item => ({ id: item, name: `${item} minutes` })
                        )}
                      >
                        {item => (
                          <Select.Option id={item.id} textValue={item.name}>
                            {item.name}
                          </Select.Option>
                        )}
                      </Select.List>
                    </Select>
                  )}
                />
                <Controller
                  name="reasonForAppointment"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      label="Reason for Visit"
                      {...field}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer className="flex-col">
            <Button
              appearance="outline"
              onPress={() => onOpenChange(false)}
              size="small"
            >
              Cancel
            </Button>
            <SubmitButton
              intent="primary"
              size="small"
              form="bookAppointmentForm"
              type="submit"
              className="sm:w-auto mt-0"
              isLoading={status === 'pending'}
            >
              Confirm Booking
            </SubmitButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
}
