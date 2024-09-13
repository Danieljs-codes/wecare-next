import { bookAppointment } from '@/actions/book-appointment';
import {
  PatientInitiatedAppointmentSchema,
  patientInitiatedAppointmentSchema,
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
import { Textarea } from '@ui/textarea';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface NewAppointmentPatientModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  doctorId: string;
  doctorLastName: string;
}

export const NewAppointmentPatientModal = ({
  isOpen,
  onOpenChange,
  doctorId,
  doctorLastName,
}: NewAppointmentPatientModalProps) => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    clearErrors,
  } = useForm<PatientInitiatedAppointmentSchema>({
    resolver: zodResolver(patientInitiatedAppointmentSchema),
    defaultValues: {
      reasonForAppointment: '',
      doctorId,
      // The ! is to set default value as null instead of undefined since if I set it to undefined, it will move from being an uncontrolled component to a controlled component
      appointmentDuration: null!,
      appointmentDateTime: parseZonedDateTime(
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
    mutationKey: ['createAppointmentPatient'],
    mutationFn: async (data: PatientInitiatedAppointmentSchema) => {
      const { appointmentDateTime, ...rest } = data;
      const res = await bookAppointment({
        ...rest,
        // I have an object I want to convert to UTC ISO 8601 string use set
        appointmentDateTime: DateTime.fromObject(
          {
            year: appointmentDateTime.year,
            month: appointmentDateTime.month,
            day: appointmentDateTime.day,
            hour: appointmentDateTime.hour,
            minute: appointmentDateTime.minute,
            second: appointmentDateTime.second,
            millisecond: 0,
          },
          { zone: appointmentDateTime.timeZone }
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

    onSuccess: data => {
      console.log(data);
      toast.success(data.message);
      // handleCloseModal();
      reset({
        appointmentDuration: null!,
        reasonForAppointment: '',
      });

      router.push(data.paymentUrl);
    },
  });

  const onSubmit = (data: PatientInitiatedAppointmentSchema) => {
    console.log(data);
    mutate(data);
  };

  return (
    <div>
      <Modal>
        <Modal.Content
          closeButton={false}
          isOpen={isOpen}
          onOpenChange={handleCloseModal}
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
                  name="doctorId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      label="Doctor ID"
                      isDisabled
                      description={`The unique identifier for Dr. ${doctorLastName}`}
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
                      minValue={today(getLocalTimeZone())}
                      label="Appointment Date"
                      hideTimeZone
                      hourCycle={12}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  name="appointmentDuration"
                  control={control}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <Select
                      placeholder="Select duration"
                      label="Appointment Duration"
                      selectedKey={value}
                      onSelectionChange={onChange}
                      {...field}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    >
                      <Select.Trigger />
                      <Select.List
                        className="text-sm"
                        items={patientInitiatedAppointmentSchema.shape.appointmentDuration.options.map(
                          item => ({ id: item, name: item })
                        )}
                      >
                        {item => (
                          <Select.Option id={item.id} textValue={item.name}>
                            {item.name} minutes
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
                    <Textarea
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
              onPress={handleCloseModal}
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
};
