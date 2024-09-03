'use client';

import { newAppointmentSchema } from '@/schemas/new-appointment';
import {
  getLocalTimeZone,
  now,
  parseZonedDateTime,
} from '@internationalized/date';
import { Button } from '@ui/button';
import { DatePicker } from '@ui/date-picker';
import { Modal } from '@ui/modal';
import { Select } from '@ui/select';
import { SubmitButton } from '@ui/submit-button';
import { TextField } from '@ui/text-field';
import { TimeField } from '@ui/time-field';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const NewAppointmentModal = ({
  isOpen,
  onOpenChange,
}: NewAppointmentModalProps) => {
  const {} = useForm();
  const twoHoursFromNow = parseZonedDateTime(
    now(getLocalTimeZone()).add({ hours: 2 }).toString()
  );
  const [value, setValue] = useState(twoHoursFromNow);

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
            <form>
              <div className="flex flex-col gap-4">
                <TextField
                  label="Patient ID"
                  description="A 6-digit number used for identifying patients"
                  descriptionClassName="text-xs sm:text-sm"
                />
                <DatePicker
                  hideTimeZone
                  hourCycle={12}
                  value={value}
                  onChange={val => {
                    setValue(val);
                    console.log(val);
                  }}
                  label="Appointment Date"
                />
                <div className="flex items-center gap-x-2">
                  <Select
                    placeholder="Select duration"
                    label="Appointment Duration"
                  >
                    <Select.Trigger />
                    <Select.List
                      className="text-sm"
                      items={newAppointmentSchema.shape.appointmentDuration.options.map(
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
                </div>
                <TextField label="Reason for Visit" />
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
