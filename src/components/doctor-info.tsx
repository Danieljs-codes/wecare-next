'use client';

import { DoctorWithReviews } from '@lib/types';
import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import {
  IconCalendarPlus,
  IconHighlightWave,
  IconPencilBox,
  IconStar,
} from 'justd-icons';
import { NewAppointmentPatientModal } from '@components/new-appointment-patient-modal';
import { useState } from 'react';
import { ReviewModal } from '@components/review-modal';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card } from '@ui/card';
import { Avatar } from '@ui/avatar';
import { DateTime } from 'luxon';
import { reviewDoctor } from '@/actions/review-doctor';

const reviewSchema = z.object({
  doctorId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export function DoctorInfo({
  doctorInfo,
  patientId,
}: {
  doctorInfo: DoctorWithReviews;
  patientId: string;
}) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<{
    rating: number;
    comment: string;
  } | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const { mutateAsync } = useMutation({
    mutationKey: ['reviewDoctor'],
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      const res = await reviewDoctor(data);

      if (!res.success) {
        throw new Error(res.error);
      }

      return res;
    },
  });

  const handleEditReview = (review: { rating: number; comment: string }) => {
    setCurrentReview(review);
    setModalKey(prevKey => prevKey + 1); // Force re-render
    setIsReviewModalOpen(true);
  };

  const handleSubmit = (rating: number, comment: string) => {
    toast.promise(mutateAsync({ doctorId: doctorInfo.id, rating, comment }), {
      loading: 'Submitting review...',
      success: (data: any) => {
        setCurrentReview(null); // Reset current review after submission
        return `${data.message}`;
      },
      error: (error: Error) => `${error.message}`,
    });
  };

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
              <Button
                size="small"
                intent="secondary"
                onPress={() => setIsReviewModalOpen(true)}
              >
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
          <div className="px-4 -translate-y-12 mb-6">
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
          <div className="px-4 -translate-y-12">
            <h2 className="text-base font-semibold mb-4">
              Reviews{' '}
              <span className="text-xs text-muted-fg">
                ({doctorInfo.reviews.length} Reviews)
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorInfo.reviews.map(review => (
                <Card key={review.id} className="flex flex-col">
                  <Card.Header>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Avatar
                          src={review.patient.user.avatar}
                          alt={`Patient ${review.patient.user.firstName} ${review.patient.user.lastName}`}
                          initials={`${review.patient.user.firstName[0]}${review.patient.user.lastName[0]}`}
                          size="large"
                          className="mr-4"
                        />
                        <div>
                          <h3 className="font-semibold text-fg text-sm">
                            {review.patient.user.firstName}{' '}
                            {review.patient.user.lastName}
                          </h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <IconStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {patientId === review.patient.id && (
                        <Button
                          size="square-petite"
                          appearance="plain"
                          className="ml-auto"
                          onPress={() =>
                            handleEditReview({
                              rating: review.rating,
                              comment: review.comment || '',
                            })
                          }
                        >
                          <IconHighlightWave className="size-4" />
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Content className="flex-grow">
                    <p className="text-muted-fg text-sm">{review.comment}</p>
                  </Card.Content>
                  <Card.Footer className="text-sm text-fg">
                    {DateTime.fromISO(review.updatedAt).toRelative()}
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <NewAppointmentPatientModal
        doctorId={doctorInfo.id}
        doctorLastName={doctorInfo.user.lastName}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
      <ReviewModal
        key={modalKey}
        isOpen={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSubmit={handleSubmit}
        defaultRating={currentReview?.rating || 0}
        defaultReview={currentReview?.comment || ''}
      />
    </div>
  );
}
