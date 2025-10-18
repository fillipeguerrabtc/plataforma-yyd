'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as styles from '../styles/components.css';

interface Tour {
  id: number;
  title_en: string;
  description_en: string;
  city: string;
  base_price_eur: number;
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
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 50,
              }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '85vh',
                overflow: 'auto',
                zIndex: 51,
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            >
              <Dialog.Title style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#1A1A1A',
                marginBottom: '8px',
                fontFamily: "'Montserrat', sans-serif",
              }}>
                {tour.title_en}
              </Dialog.Title>
              <Dialog.Description style={{
                fontSize: '1rem',
                color: '#37C8C4',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '24px',
              }}>
                {tour.city} · {tour.duration_minutes} minutes
              </Dialog.Description>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                  fontFamily: "'Montserrat', sans-serif",
                }}>
                  Tour Description
                </h4>
                <p style={{
                  color: '#666',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                }}>
                  {tour.description_en}
                </p>
              </div>

              <div style={{
                backgroundColor: '#F5F5F5',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '1rem', color: '#666' }}>Total Price:</span>
                  <span style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#37C8C4',
                    fontFamily: "'Montserrat', sans-serif",
                  }}>
                    €{tour.base_price_eur}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px' 
              }}>
                <Dialog.Close asChild>
                  <button style={{
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: '2px solid #E9C46A',
                    backgroundColor: 'white',
                    color: '#E9C46A',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'all 0.3s ease',
                  }}>
                    Cancel
                  </button>
                </Dialog.Close>
                <button style={{
                  padding: '16px 24px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E9C46A 0%, #d4a84f 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Montserrat', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                }}>
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
