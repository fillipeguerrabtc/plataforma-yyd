'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import * as styles from '../styles/sections.css';

function AnimatedNumber({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsCounter() {
  const stats = [
    { number: 200, suffix: '+', label: 'happy clients' },
    { number: 5, suffix: '+', label: 'years of expertise' },
    { number: 6, suffix: '', label: 'professional team members' },
    { number: 257, suffix: '+', label: '5-star reviews' },
  ];

  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <p className={styles.statsIntro}>
            So many happy travelers can&apos;t be wrong — your unforgettable experience starts here.
          </p>
        </motion.div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={styles.statCard}
            >
              <div className={styles.statNumber}>
                <AnimatedNumber end={stat.number} suffix={stat.suffix} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
