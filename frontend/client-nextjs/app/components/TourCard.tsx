'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as styles from '../styles/components.css';
import * as modalStyles from '../styles/modal.css';

interface Tour {
  id: string;
  title_en: string;
  description_en: string;
  city: string;
  base_price_eur: string | number;
  duration_minutes: number;
}

interface TourCardProps {
  tour: Tour;
  index: number;
}

export function TourCard({ tour, index }: TourCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={styles.tourCard}
      >
        <div className={styles.tourCardContent}>
          <h3 className={styles.tourTitle}>{tour.title_en}</h3>
          <p className={styles.tourCity}>{tour.city}</p>
          <p className={styles.tourDescription}>
            {tour.description_en?.substring(0, 150)}...
          </p>
          <div className={styles.tourDetails}>
            <span className={styles.tourPrice}>€{tour.base_price_eur}</span>
            <span className={styles.tourDuration}>{tour.duration_minutes} min</span>
          </div>
          <button 
            className={styles.bookButton}
            onClick={() => setOpen(true)}
          >
            Book Now
          </button>
        </div>
      </motion.div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={modalStyles.overlay}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={modalStyles.content}
            >
              <Dialog.Title className={modalStyles.title}>
                {tour.title_en}
              </Dialog.Title>
              <Dialog.Description className={modalStyles.description}>
                {tour.city} · {tour.duration_minutes} minutes
              </Dialog.Description>

              <div className={modalStyles.section}>
                <h4 className={modalStyles.sectionTitle}>
                  Tour Description
                </h4>
                <p className={modalStyles.sectionText}>
                  {tour.description_en}
                </p>
              </div>

              <div className={modalStyles.priceBox}>
                <span className={modalStyles.priceLabel}>Total Price:</span>
                <span className={modalStyles.priceValue}>
                  €{typeof tour.base_price_eur === 'string' ? parseFloat(tour.base_price_eur) : tour.base_price_eur}
                </span>
              </div>

              <div className={modalStyles.buttonGroup}>
                <Dialog.Close asChild>
                  <button className={modalStyles.cancelButton}>
                    Cancel
                  </button>
                </Dialog.Close>
                <button className={modalStyles.confirmButton}>
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
