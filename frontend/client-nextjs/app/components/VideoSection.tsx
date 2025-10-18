'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/sections.css';

export function VideoSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.sectionTitle}>
            What Not to Miss in Sintra: Watch Before You Visit
          </h2>
          <p className={styles.sectionSubtitle}>
            Not sure where to start in Sintra? In this quick video, our local guide shares the 6 places 
            you can&apos;t miss — from iconic landmarks to hidden gems. Get inspired and plan your perfect day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            marginTop: '2rem',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
          }}>
            <iframe
              src="https://www.youtube.com/embed/N3takXF4Lx8"
              title="What Not to Miss in Sintra"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={styles.textCenter}
          style={{ marginTop: '2rem' }}
        >
          <a href="#tours" className={styles.ctaButton}>
            See Our Tour Options
          </a>
        </motion.div>
      </div>
    </section>
  );
}
