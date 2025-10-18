'use client';

import { motion } from 'framer-motion';
import * as styles from '../styles/testimonials.css';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Best part of our Portugal trip! Daniel made us feel like locals and took us to places we'll never forget.",
      author: "Sarah & Mark",
      location: "USA",
      avatar: "🌟",
    },
    {
      quote: "One of the best days of our trip! The personalized tour was exactly what we needed. Highly recommend!",
      author: "João & Maria",
      location: "Brazil",
      avatar: "⭐",
    },
    {
      quote: "He exceeded our expectations and they were very high. The tuk tuk tour was the highlight of our honeymoon!",
      author: "Emma & James",
      location: "UK",
      avatar: "💫",
    },
  ];

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.sectionTitle}>
            What Travelers Say About Our Tuk Tuk Tours
          </h2>
          <p className={styles.sectionSubtitle}>
            Over the years, couples, families, and travelers of all ages have explored Sintra & Cascais 
            with us — and their words say it all.
          </p>
        </motion.div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={styles.testimonialCard}
            >
              <div className={styles.quoteIcon}>&ldquo;</div>
              <p className={styles.quote}>{testimonial.quote}</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{testimonial.avatar}</div>
                <div>
                  <div className={styles.authorName}>{testimonial.author}</div>
                  <div className={styles.authorLocation}>{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={styles.ctaContainer}
        >
          <a href="#contact" className={styles.ctaButton}>
            Book Your Tour Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
