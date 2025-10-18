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
  featured?: boolean;
}

interface TourCardProps {
  tour: Tour;
  index: number;
}

export function TourCard({ tour, index }: TourCardProps) {
  const [open, setOpen] = useState(false);
  
  const duration = typeof tour.duration_minutes === 'string' ? parseInt(tour.duration_minutes) : tour.duration_minutes;
  const price = typeof tour.base_price_eur === 'string' ? parseFloat(tour.base_price_eur) : tour.base_price_eur;
  
  const isBestChoice = duration >= 480;
  const isPopular = tour.featured || price >= 300;
  
  const hours = Math.floor(duration / 60);
  const durationText = hours >= 1 ? `${hours}h${duration % 60 > 0 ? ` ${duration % 60}min` : ''}` : `${duration}min`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={styles.tourCard}
      >
        {isBestChoice && (
          <div className={styles.bestChoiceBadge}>Best Choice</div>
        )}
        {!isBestChoice && isPopular && (
          <div className={styles.popularBadge}>Popular</div>
        )}
        
        <div className={styles.tourCardContent}>
          <div className={styles.tourCategory}>{tour.city}</div>
          <h3 className={styles.tourTitle}>{tour.title_en}</h3>
          <p className={styles.tourDescription}>
            {tour.description_en?.substring(0, 150)}...
          </p>
          
          <div className={styles.tourMeta}>
            <div className={styles.tourMetaItem}>
              <span className={styles.tourMetaIcon}>⏱️</span>
              <span className={styles.tourMetaText}>{durationText}</span>
            </div>
            <div className={styles.tourMetaItem}>
              <span className={styles.tourMetaIcon}>👥</span>
              <span className={styles.tourMetaText}>1-4 people</span>
            </div>
          </div>
          
          <div className={styles.tourPriceSection}>
            <div className={styles.tourPriceWrapper}>
              <span className={styles.tourPriceLabel}>Starting at</span>
              <span className={styles.tourPrice}>€{tour.base_price_eur}</span>
            </div>
          </div>
          
          <button 
            className={styles.bookButton}
            onClick={() => setOpen(true)}
          >
            Learn More →
          </button>
        </div>
      </motion.div>

      <BookingModal tour={tour} open={open} onOpenChange={setOpen} />
    </>
  );
}
