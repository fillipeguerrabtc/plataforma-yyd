'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as styles from '../styles/components.css';
import { BookingModal } from './BookingModal';

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

      <BookingModal tour={tour} open={open} onOpenChange={setOpen} />
    </>
  );
}
