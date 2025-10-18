'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/hero.css';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Video Background - fallback to gradient if video not available */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.videoBackground}
        poster="https://images.unsplash.com/photo-1563492065421-68d4d33c90d7?w=1920"
      >
        <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
      </video>
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
