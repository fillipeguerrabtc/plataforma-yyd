'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/contact.css';

export function ContactSection() {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.contactTitle}>
            Ready to Plan Your Unforgettable Trip?
          </h2>
          <p className={styles.contactSubtitle}>
            Let&apos;s make your dream tour a reality. Whether you have questions or are ready to book, 
            we&apos;re here to help you every step of the way.
          </p>
        </motion.div>

        <div className={styles.contactGrid}>
          <motion.a
            href="https://wa.link/y0m3y9"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className={styles.contactCard}
          >
            <span className={styles.recommendedBadge}>Recommended</span>
            <div className={styles.contactIcon}>💬</div>
            <h3 className={styles.contactMethod}>WhatsApp</h3>
            <p className={styles.contactDescription}>
              Fastest way to reach us.<br />
              Click below to start chatting now.
            </p>
            <div className={styles.contactButton}>Message Us on WhatsApp</div>
          </motion.a>

          <motion.a
            href="https://www.m.me/1566043420168290"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={styles.contactCard}
          >
            <span className={styles.recommendedBadge}>Recommended</span>
            <div className={styles.contactIcon}>📱</div>
            <h3 className={styles.contactMethod}>Messenger</h3>
            <p className={styles.contactDescription}>
              Prefer Facebook?<br />
              We&apos;re available there too.
            </p>
            <div className={styles.contactButton}>Message Us on Messenger</div>
          </motion.a>

          <motion.a
            href="mailto:info@yesyoudeserve.tours"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={styles.contactCard}
          >
            <span className={styles.lastOptionBadge}>Use it as last option</span>
            <div className={styles.contactIcon}>📧</div>
            <h3 className={styles.contactMethod}>Email</h3>
            <p className={styles.contactDescription}>
              For detailed inquiries<br />
              or special requests.
            </p>
            <div className={styles.contactButton}>Send An E-mail</div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
