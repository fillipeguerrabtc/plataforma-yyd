'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/hero.css';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroTextContainer}
        >
          <h1 className={styles.heroTitle}>
            Private Tuk Tuk Tours in Sintra & Cascais<br />
            <span className={styles.heroTitleHighlight}>Explore Like a Local!</span>
          </h1>
          <p className={styles.heroSubtitle}>
            See the best of Sintra and Cascais with a local guide on a comfortable tuk tuk.<br />
            Personalized tours, no crowds, and the freedom to explore your way.
          </p>
          
          <div className={styles.heroButtons}>
            <a href="#tours" className={styles.heroCTA}>
              Explore Our Tours
            </a>
            <a href="#contact" className={styles.heroCTASecondary}>
              Talk to Our Team
            </a>
          </div>

          {/* Trustindex Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={styles.trustBadge}
          >
            <div className={styles.trustStars}>⭐⭐⭐⭐⭐</div>
            <div className={styles.trustText}>
              <strong>257 reviews</strong> on Trustindex
            </div>
          </motion.div>

          {/* ABC GMA Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={styles.mediaFeature}
          >
            <p className={styles.asSeenOn}>As seen on:</p>
            <div className={styles.abcBadge}>
              📺 ABC Good Morning America
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
