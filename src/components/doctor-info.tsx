'use client';

import { DoctorWithReviews } from '@lib/types';
import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import { IconCalendarPlus, IconPencilBox } from 'justd-icons';
import { NewAppointmentPatientModal } from './new-appointment-patient-modal';
import { useState } from 'react';

export function DoctorInfo({ doctorInfo }: { doctorInfo: DoctorWithReviews }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="-m-4 sm:-m-6 lg:-m-10">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1499748926165-1085fc69e9fc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt={`Dr. ${doctorInfo.user.firstName} ${doctorInfo.user.lastName} Cover Photo`}
            className="w-full object-cover h-[160px] md:h-[240px]"
          />
          <div className="px-4 -translate-y-12 mb-4">
            <div
              className="size-24 rounded-full bg-cover bg-center p-1 shadow-lg border-4 border-white mb-4"
              style={{ backgroundImage: `url(${doctorInfo.user.avatar})` }}
              aria-label="Dr. Olamide"
            ></div>
            <h2
              className="text-2xl font-semibold text-fg mb-1"
              style={{ fontSize: '24px', fontStyle: 'normal', fontWeight: 600 }}
            >
              Dr. {doctorInfo.user.firstName} {doctorInfo.user.lastName}
            </h2>
            <p className="text-sm text-muted-fg mb-4">{doctorInfo.bio}</p>
            <div className="flex items-center gap-x-2">
              <Button size="small" intent="secondary">
                <IconPencilBox />
                Review
              </Button>
              <Button
                onPress={() => setIsOpen(true)}
                size="small"
                intent="primary"
              >
                <IconCalendarPlus />
                Book Appointment
              </Button>
            </div>
          </div>
          <div className="px-4 -translate-y-12 mb-8">
            <Separator />
          </div>
          {/* About the doctor */}
          <div className="px-4 -translate-y-12">
            <h2 className="text-base font-semibold mb-2">About the doctor</h2>
            <div className="text-sm text-muted-fg space-y-3 leading-[150%]">
              <p>
                I&apos;m a Product Designer based in Melbourne, Australia. I
                enjoy working on product design, design systems, and Webflow
                projects, but I don&apos;t take myself too seriously.
              </p>
              <p>
                I&apos;ve worked with some of the world&apos;s most exciting
                companies, including Coinbase, Stripe, and Linear. I&apos;m
                passionate about helping startups grow, improve their UX and
                customer experience, and to raise venture capital through good
                design.
              </p>
              <p>
                My work has been featured on Typewolf, Mindsparkle Magazine,
                Webflow, Fonts In Use, CSS Winner, httpster, Siteinspire, and
                Best Website Gallery.
              </p>
            </div>
          </div>
        </div>
      </div>
      <NewAppointmentPatientModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}
