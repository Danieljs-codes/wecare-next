'use client';

import { DoctorNotifications, PatientNotifications } from '@lib/types';
import { Avatar } from '@ui/avatar';
import { Separator } from '@ui/separator';
import { Sheet } from '@ui/sheet';
import { DateTime } from 'luxon';
import { useSearchParams, useRouter } from 'next/navigation';
import { Fragment } from 'react';

export function NotificationsSheet({
  notifications,
  userType,
}: {
  notifications: DoctorNotifications[] | PatientNotifications[];
  userType: 'doctor' | 'patient';
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOpen = searchParams.get('notifications') === 'open';

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('notifications');
    router.push(`?${params.toString()}`);
  };

  return (
    <Sheet>
      <Sheet.Content
        isOpen={isOpen}
        onOpenChange={handleClose}
        side="right"
        isStack={true}
        isBlurred
      >
        <Sheet.Header className="border-b border-border mb-2">
          <Sheet.Title className="text-lg sm:text-xl font-semibold">
            Notifications
          </Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          {notifications.map((notification, index) => (
            <Fragment key={notification.notificationId}>
              <div key={notification.notificationId}>
                <div className="flex gap-x-2">
                  <Avatar
                    src={
                      userType === 'doctor'
                        ? // @ts-expect-error
                          notification.patientAvatar
                        : // @ts-expect-error
                          notification.doctorAvatar
                    }
                  />
                  <div className="flex flex-col gap-y-1">
                    <p className="text-xs sm:text-[13px] font-medium leading-5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-fg">
                      {DateTime.fromISO(notification.createdAt).toLocaleString(
                        DateTime.DATETIME_MED
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end text-xs text-muted-fg">
                  {DateTime.fromISO(notification.createdAt).toRelative()}
                </div>
              </div>
              {index < notifications.length - 1 && (
                <Separator className="my-2" />
              )}
            </Fragment>
          ))}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
