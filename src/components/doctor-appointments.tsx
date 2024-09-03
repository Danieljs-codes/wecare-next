"use client"

export const DoctorAppointments = () => {
  return <div><div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
  <div>
    <h1 className="font-semibold text-xl mb-2">Appointments</h1>
    <p className="text-xs md:text-sm text-muted-fg">
      Manage your appointments and schedules with ease.
    </p>
  </div>
  <Button
    onPress={() => setIsOpen(true)}
    size="small"
    intent="primary"
    className="w-full md:w-auto mt-4"
  >
    <IconPlus />
    Add Appointment
  </Button>
</div></div>;gir
};

