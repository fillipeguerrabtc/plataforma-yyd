'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/sections.css';

export function NoCrowdsSection() {
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
            No Crowds. No Stress. Just You and Sintra.
          </h2>
          <p className={styles.sectionText}>
            Say goodbye to crowded buses and rigid schedules. Our private tuk tuk tours offer 
            the freedom to explore Sintra & Cascais on your terms, ensuring a relaxed and 
            memorable journey tailored just for you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
