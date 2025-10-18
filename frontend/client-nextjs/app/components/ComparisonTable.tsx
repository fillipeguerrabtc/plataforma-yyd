'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/comparison.css';

export function ComparisonTable() {
  const packages = [
    {
      name: 'Half-Day Tour',
      duration: '4 hours',
      features: [
        { name: 'Visit all monuments outside', included: true },
        { name: 'Cabo da Roca', included: true },
        { name: 'Wine Tour', included: false },
        { name: 'Wine Tasting', included: 'optional', note: '€24 per person' },
        { name: 'Be guided inside monuments', included: false },
        { name: 'Personalized Itinerary', included: true },
        { name: 'Authentic Portuguese Lunch', included: false },
        { name: 'Azenhas do Mar', included: false },
        { name: 'Cascais', included: false },
        { name: 'Transfer service', included: 'optional', note: 'additional cost' },
        { name: 'All costs INCLUDED', included: false },
      ],
      price: 'Starting at €280',
      note: 'Prices vary according to date and number of people.',
    },
    {
      name: 'Personalized Full-Day',
      duration: '8 hours',
      bestChoice: true,
      features: [
        { name: 'Visit all monuments outside', included: true },
        { name: 'Cabo da Roca', included: true },
        { name: 'Wine Tour', included: true },
        { name: 'Wine Tasting', included: 'optional', note: '€24 per person' },
        { name: 'Be guided inside monuments', included: true, note: 'Tickets not included' },
        { name: 'Personalized Itinerary', included: true },
        { name: 'Authentic Portuguese Lunch', included: true, note: 'Costs apart' },
        { name: 'Azenhas do Mar', included: true },
        { name: 'Cascais', included: true },
        { name: 'Transfer service', included: 'optional', note: 'additional cost' },
        { name: 'All costs INCLUDED', included: false },
      ],
      price: 'Starting at €420',
      note: 'Prices vary according to date and number of people.',
    },
    {
      name: 'All-Inclusive Experience',
      duration: '8 hours',
      features: [
        { name: 'Visit all monuments outside', included: true },
        { name: 'Cabo da Roca', included: true },
        { name: 'Wine Tour', included: true },
        { name: 'Wine Tasting', included: true },
        { name: 'Be guided inside monuments', included: true },
        { name: 'Personalized Itinerary', included: true },
        { name: 'Authentic Portuguese Lunch', included: true },
        { name: 'Azenhas do Mar', included: true },
        { name: 'Cascais', included: true },
        { name: 'Transfer service', included: true },
        { name: 'All costs INCLUDED', included: true },
      ],
      price: 'Starting at €640',
      note: 'Prices vary according to date and number of people.',
    },
  ];

  const featureNames = [
    'Duration',
    'Visit all monuments outside',
    'Cabo da Roca',
    'Wine Tour',
    'Wine Tasting',
    'Be guided inside monuments',
    'Personalized Itinerary',
    'Authentic Portuguese Lunch',
    'Azenhas do Mar',
    'Cascais',
    'Transfer service',
    'All costs INCLUDED',
    'Price',
    'Note',
  ];

  return (
    <section className={styles.comparisonSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.sectionTitle}>Packages</h2>
        </motion.div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thFeature}>Feature</th>
                {packages.map((pkg, index) => (
                  <th key={index} className={styles.thPackage}>
                    <div className={styles.packageHeader}>
                      {pkg.bestChoice && <span className={styles.bestChoiceBadge}>Best Choice</span>}
                      <h3 className={styles.packageName}>{pkg.name}</h3>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tdFeature}>Duration</td>
                {packages.map((pkg, index) => (
                  <td key={index} className={styles.tdValue}>{pkg.duration}</td>
                ))}
              </tr>
              {packages[0].features.map((_, featureIndex) => {
                const featureName = packages[0].features[featureIndex].name;
                return (
                  <tr key={featureIndex}>
                    <td className={styles.tdFeature}>{featureName}</td>
                    {packages.map((pkg, pkgIndex) => {
                      const feature = pkg.features[featureIndex];
                      return (
                        <td key={pkgIndex} className={styles.tdValue}>
                          {feature.included === true && <span className={styles.checkmark}>✓</span>}
                          {feature.included === false && <span className={styles.cross}>–</span>}
                          {feature.included === 'optional' && (
                            <div>
                              <span className={styles.optional}>Optional</span>
                              {feature.note && <div className={styles.note}>({feature.note})</div>}
                            </div>
                          )}
                          {typeof feature.included === 'boolean' && feature.note && (
                            <div className={styles.note}>({feature.note})</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className={styles.tdFeature}>Price</td>
                {packages.map((pkg, index) => (
                  <td key={index} className={styles.tdPrice}>{pkg.price}</td>
                ))}
              </tr>
              <tr>
                <td className={styles.tdFeature}>Note</td>
                {packages.map((pkg, index) => (
                  <td key={index} className={styles.tdNote}>{pkg.note}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
