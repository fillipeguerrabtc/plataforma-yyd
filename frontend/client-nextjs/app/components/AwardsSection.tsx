'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/sections.css';

export function AwardsSection() {
  const awards = [
    {
      title: 'Most Unique Tuk Tuk Tour Company 2024',
      subtitle: 'Portugal',
      icon: '🏆',
      organization: 'LUXlife Magazine',
    },
    {
      title: 'Best Private Tour Company in Portugal',
      subtitle: '2025',
      icon: '🌟',
      organization: 'Evergreen Awards',
    },
  ];

  return (
    <section className={styles.sectionGray}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.sectionTitle}>
            Awards and Media Recognition
          </h2>
          <p className={styles.sectionText}>
            Why travelers trust Yes, You Deserve for private tours in Portugal.
          </p>
        </motion.div>

        <div className={styles.awardsGrid}>
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className={styles.awardCard}
            >
              <div className={styles.awardIcon}>{award.icon}</div>
              <h3 className={styles.awardTitle}>{award.title}</h3>
              <p className={styles.awardSubtitle}>{award.subtitle}</p>
              <p className={styles.awardOrg}>{award.organization}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
