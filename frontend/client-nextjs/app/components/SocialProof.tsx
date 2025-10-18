'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/socialproof.css';

export function SocialProof() {
  const stats = [
    { number: '1,000+', label: 'happy clients' },
    { number: '10+', label: 'years of expertise' },
    { number: '15', label: 'professional team members' },
    { number: '200+', label: '5-star TripAdvisor reviews' },
  ];

  return (
    <section className={styles.socialProofSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.content}
        >
          <p className={styles.tagline}>
            So many happy travelers can't be wrong — your unforgettable experience starts here.
          </p>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={styles.statCard}
              >
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className={styles.badges}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={styles.badge}
            >
              <div className={styles.googleBadge}>
                <svg viewBox="0 0 48 48" className={styles.googleIcon}>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <div>
                  <div className={styles.rating}>5.0</div>
                  <div className={styles.ratingText}>Top Rated Service 2025</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={styles.abcBadge}
            >
              <div className={styles.abcText}>As Seen On</div>
              <div className={styles.abcLogo}>Good Morning America</div>
              <div className={styles.abcSubtext}>Featured by ABC News</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
