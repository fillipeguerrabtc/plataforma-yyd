'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/sections.css';

export function FeaturesSection() {
  const features = [
    {
      icon: '🗺️',
      title: 'Personalized Itineraries',
      description: 'Choose what you want to see. We\'ll design a tour around your interests and timing — no rigid plans, no rush.',
    },
    {
      icon: '👨‍🏫',
      title: 'Local Expert Guides',
      description: 'Our friendly, English-speaking guides know Sintra like no one else. Expect history, stories, and the best local tips.',
    },
    {
      icon: '🚗',
      title: 'Spacious & Comfortable Tuk Tuks',
      description: 'Travel with ease in our premium electric tuk tuks — perfect for exploring narrow streets while staying relaxed.',
    },
    {
      icon: '✅',
      title: 'Easy Booking & Support',
      description: 'From the first message to the final goodbye, we\'re here to help. Booking is quick, and we answer fast.',
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
            How We Simplify Your Experience
          </h2>
        </motion.div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
