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
import { Button } from '@ui/button';
import { DatePicker } from '@ui/date-picker';
import { Modal } from '@ui/modal';
import { Note } from '@ui/note';
import { Select } from '@ui/select';
import { SubmitButton } from '@ui/submit-button';
import { TextField } from '@ui/text-field';
import { Textarea } from '@ui/textarea';
import { Controller, useForm } from 'react-hook-form';

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInitiatedAppointmentSchema>({
    resolver: zodResolver(patientInitiatedAppointmentSchema),
    defaultValues: {
      reasonForAppointment: '',
      doctorId,
      appointmentDuration: undefined,
      appointmentDateTime: parseZonedDateTime(
        now(getLocalTimeZone())
          .add({ hours: 2 })
          .set({ minute: 0, second: 0, millisecond: 0 })
          .toString()
      ),
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div>
      <Modal>
        <Modal.Content
          closeButton={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Header>
            <Modal.Title>Schedule New Appointment</Modal.Title>
            <Modal.Description className="text-xs sm:text-sm">
              Book your next appointment quickly and easily. Choose a date,
              time, and service that works best for you.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <form id="bookAppointmentForm" onSubmit={handleSubmit(onSubmit)}>
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
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      placeholder="Select duration"
                      label="Appointment Duration"
                      {...field}
                      onSelectionChange={selected => field.onChange(selected)}
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
              isLoading={false}
            >
              Confirm Booking
            </SubmitButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
};
