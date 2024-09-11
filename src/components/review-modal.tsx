import { useEffect, useState } from 'react';
import { Modal } from '@ui/modal';
import { Button } from '@ui/button';
import { Textarea } from '@ui/textarea';
import { motion } from 'framer-motion';
import { IconStar } from 'justd-icons';

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (rating: number, review: string) => void;
  defaultRating?: number;
  defaultReview?: string;
}

export function ReviewModal({
  isOpen,
  onOpenChange,
  onSubmit,
  defaultRating,
  defaultReview,
}: ReviewModalProps) {
  const [rating, setRating] = useState(defaultRating ?? 0);
  const [review, setReview] = useState(defaultReview ?? '');

  const handleSubmit = () => {
    onSubmit(rating, review);
    onOpenChange(false);
  };

  useEffect(() => {
    console.log(rating, review);
  }, [rating, review, isOpen]);

  return (
    <Modal>
      <Modal.Content isBlurred isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Header>
          <Modal.Title>Write a Review</Modal.Title>
          <Modal.Description>
            Share your experience with the doctor
          </Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <motion.button
                key={`${star}${defaultRating}`}
                className="text-2xl focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
              >
                <motion.span
                  initial={false}
                  animate={{ scale: star <= rating ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                >
                  <IconStar
                    className={
                      star <= rating
                        ? 'text-warning fill-warning'
                        : 'text-muted-fg fill-transparent'
                    }
                  />
                </motion.span>
              </motion.button>
            ))}
          </div>
          <Textarea
            label="Your Review"
            value={review}
            onChange={value => setReview(value)}
            placeholder="Write your review here..."
            className="text-sm min-h-10"
            rows={3}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="small"
            appearance="outline"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="small" onPress={handleSubmit} isDisabled={rating === 0}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
