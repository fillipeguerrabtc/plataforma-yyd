'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as styles from '../styles/leadform.css';

export function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    privacy: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/leads/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          source: formData.source || null,
          privacy_consent: formData.privacy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      const data = await response.json();
      console.log('✅ Lead submitted successfully:', data);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', source: '', privacy: false });
      }, 3000);
    } catch (error) {
      console.error('❌ Error submitting lead:', error);
      alert('There was an error submitting your information. Please try again.');
    }
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={styles.textCenter}
        >
          <h2 className={styles.sectionTitle}>Let&apos;s Plan Your Trip?</h2>
          <p className={styles.sectionSubtitle}>
            Ready for your unforgettable trip? Just a few details below, and then you can select 
            your preferred way to connect with us!
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone <span className={styles.optional}>(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                className={styles.input}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="source" className={styles.label}>
                Where did you hear about us? <span className={styles.optional}>(Optional)</span>
              </label>
              <select
                id="source"
                className={styles.select}
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="google">Google</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tripadvisor">TripAdvisor</option>
                <option value="friend">Friend or Family</option>
                <option value="blog">Blog or Article</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="privacy"
              required
              className={styles.checkbox}
              checked={formData.privacy}
              onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
            />
            <label htmlFor="privacy" className={styles.checkboxLabel}>
              I agree to the <a href="/privacy" className={styles.link}>Privacy Policy</a> and give my 
              consent for you to contact me regarding my tour inquiry. <span className={styles.required}>*</span>
            </label>
          </div>

          {submitted ? (
            <div className={styles.successMessage}>
              ✅ Thank you! We&apos;ll be in touch soon.
            </div>
          ) : (
            <button type="submit" className={styles.submitButton}>
              Plan My Tour
            </button>
          )}

          <p className={styles.disclaimer}>
            Rest assured, we value your privacy and will not send unsolicited emails.
          </p>
        </motion.form>
      </div>
    </section>
  );
}
