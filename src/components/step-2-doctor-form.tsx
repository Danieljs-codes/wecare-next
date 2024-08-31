import { doctorStep2Schema } from '@/schemas/sign-up-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Time } from '@internationalized/date';
import { getUserTimezone } from '@lib/utils';
import { NumberField } from '@ui/number-field';
import { Select } from '@ui/select';
import { Textarea } from '@ui/textarea';
import { TimeField } from '@ui/time-field';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const Step2DoctorForm = () => {
  const { handleSubmit, control } = useForm<z.infer<typeof doctorStep2Schema>>({
    resolver: zodResolver(doctorStep2Schema),
    defaultValues: {
      specialization: undefined,
      yearsOfExperience: undefined,
      availableHours: { startTime: undefined, endTime: undefined },
      timezone: getUserTimezone(),
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  return (
    <form>
      <div className="space-y-4">
        <Controller
          name="specialization"
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Select
              label="Specialization"
              placeholder="Select specialization"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
              onSelectionChange={selected => field.onChange(selected)}
            >
              <Select.Trigger />
              <Select.List
                items={doctorStep2Schema.shape.specialization.options.map(
                  item => ({ id: item, name: item })
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
          name="yearsOfExperience"
          control={control}
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <NumberField
              minValue={1}
              label="Years of Experience"
              {...field}
              isInvalid={!!error}
              errorMessage={error?.message}
            />
          )}
        />
        <div className="flex items-center gap-x-2">
          <Controller
            name="availableHours.startTime"
            control={control}
            render={({
              field: { value, onChange, ref, ...field },
              fieldState: { error },
            }) => (
              <TimeField
                label="Start Time"
                value={value ? new Time(value.hour, value.minute) : null}
                onChange={newValue => {
                  onChange(
                    newValue
                      ? { hour: newValue.hour, minute: newValue.minute }
                      : null
                  );
                }}
                {...field}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            )}
          />
          <Controller
            name="availableHours.endTime"
            control={control}
            render={({
              field: { value, onChange, ref, ...field },
              fieldState: { error },
            }) => (
              <TimeField
                label="End Time"
                value={value ? new Time(value.hour, value.minute) : null}
                onChange={newValue =>
                  onChange(
                    newValue
                      ? { hour: newValue.hour, minute: newValue.minute }
                      : null
                  )
                }
                {...field}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            )}
          />
        </div>
        <Textarea className="text-sm" label="Bio" />
      </div>
    </form>
  );
};
