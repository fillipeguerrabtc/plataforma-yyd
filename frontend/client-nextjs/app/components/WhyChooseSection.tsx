'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/sections.css';

export function WhyChooseSection() {
  const reasons = [
    {
      icon: '🔐',
      title: 'Only Private Tours',
      description: 'No groups, no strangers. Just you and your guide.',
    },
    {
      icon: '✏️',
      title: 'Custom Planning',
      description: 'We adapt the day to your rhythm and interests.',
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Guides',
      description: 'Passionate locals trained to make you feel at home.',
    },
    {
      icon: '🚗',
      title: 'Last Generation Tuk Tuks',
      description: 'Explore in style with our spacious, electric tuk tuk.',
    },
    {
      icon: '📸',
      title: 'Beautiful Photos Included',
      description: 'Leave with stunning photos and memories captured during your adventure.',
    },
    {
      icon: '⭐',
      title: '257+ Five-Star Reviews',
      description: 'Consistently rated as the best private tour company in Portugal.',
    },
  ];

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
            Why Travelers Choose Yes, You Deserve!
          </h2>
        </motion.div>

        <div className={styles.featuresGrid}>
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{reason.icon}</div>
              <h3 className={styles.featureTitle}>{reason.title}</h3>
              <p className={styles.featureDescription}>{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
