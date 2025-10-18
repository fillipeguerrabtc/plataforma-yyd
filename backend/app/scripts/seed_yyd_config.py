"""Seed YYD site configuration from official website."""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.site_config import SiteConfig, MediaAsset
from app.models.user import User
from app.core.security import get_password_hash


def seed_site_config():
    """Seed site configuration with real YYD data."""
    db: Session = SessionLocal()
    
    try:
        # Hero Section
        configs = [
            SiteConfig(
                key="hero_title",
                value_text="Private Tuk Tuk Tours in Sintra & Cascais",
                category="hero",
                description="Main hero title"
            ),
            SiteConfig(
                key="hero_subtitle",
                value_text="Explore Like a Local!",
                category="hero",
                description="Hero subtitle"
            ),
            SiteConfig(
                key="hero_description",
                value_text="See the best of Sintra and Cascais with a local guide on a comfortable tuk tuk. Personalized tours, no crowds, and the freedom to explore your way.",
                category="hero",
                description="Hero description text"
            ),
            SiteConfig(
                key="hero_cta_primary",
                value_text="Explore Our Tours",
                category="hero",
                description="Primary CTA button text"
            ),
            SiteConfig(
                key="hero_cta_secondary",
                value_text="Talk to Our Team",
                category="hero",
                description="Secondary CTA button text"
            ),
            SiteConfig(
                key="trustindex_reviews",
                value_text="257",
                category="hero",
                description="Number of Trustindex reviews"
            ),
            SiteConfig(
                key="featured_media",
                value_text="ABC Good Morning America",
                category="hero",
                description="Featured media outlet"
            ),
            
            # No Crowds Section
            SiteConfig(
                key="no_crowds_title",
                value_text="No Crowds. No Stress. Just You and Sintra.",
                category="features",
                description="No crowds section title"
            ),
            SiteConfig(
                key="no_crowds_description",
                value_text="Say goodbye to crowded buses and rigid schedules. Our private tuk tuk tours offer the freedom to explore Sintra & Cascais on your terms, ensuring a relaxed and memorable journey tailored just for you.",
                category="features",
                description="No crowds section description"
            ),
            
            # Awards Section
            SiteConfig(
                key="awards_title",
                value_text="Awards and Media Recognition",
                category="awards",
                description="Awards section title"
            ),
            SiteConfig(
                key="awards_subtitle",
                value_text="Why travelers trust Yes, You Deserve for private tours in Portugal.",
                category="awards",
                description="Awards section subtitle"
            ),
            
            # Video Section
            SiteConfig(
                key="video_title",
                value_text="What Not to Miss in Sintra: Watch Before You Visit",
                category="video",
                description="Video section title"
            ),
            SiteConfig(
                key="video_description",
                value_text="Not sure where to start in Sintra? In this quick video, our local guide shares the 6 places you can't miss — from iconic landmarks to hidden gems. Get inspired and plan your perfect day.",
                category="video",
                description="Video section description"
            ),
            SiteConfig(
                key="video_cta",
                value_text="See Our Tour Options",
                category="video",
                description="Video section CTA"
            ),
            
            # How We Simplify Section
            SiteConfig(
                key="simplify_title",
                value_text="How We Simplify Your Experience",
                category="features",
                description="Simplify section title"
            ),
            SiteConfig(
                key="feature_1_title",
                value_text="Personalized Itineraries",
                category="features",
                description="Feature 1 title"
            ),
            SiteConfig(
                key="feature_1_description",
                value_text="Choose what you want to see. We'll design a tour around your interests and timing — no rigid plans, no rush.",
                category="features",
                description="Feature 1 description"
            ),
            SiteConfig(
                key="feature_2_title",
                value_text="Local Expert Guides",
                category="features",
                description="Feature 2 title"
            ),
            SiteConfig(
                key="feature_2_description",
                value_text="Our friendly, English-speaking guides know Sintra like no one else. Expect history, stories, and the best local tips.",
                category="features",
                description="Feature 2 description"
            ),
            SiteConfig(
                key="feature_3_title",
                value_text="Spacious & Comfortable Tuk Tuks",
                category="features",
                description="Feature 3 title"
            ),
            SiteConfig(
                key="feature_3_description",
                value_text="Travel with ease in our premium electric tuk tuks — perfect for exploring narrow streets while staying relaxed.",
                category="features",
                description="Feature 3 description"
            ),
            SiteConfig(
                key="feature_4_title",
                value_text="Easy Booking & Support",
                category="features",
                description="Feature 4 title"
            ),
            SiteConfig(
                key="feature_4_description",
                value_text="From the first message to the final goodbye, we're here to help. Booking is quick, and we answer fast.",
                category="features",
                description="Feature 4 description"
            ),
            
            # Stats
            SiteConfig(
                key="stat_clients",
                value_text="1000",
                category="stats",
                description="Number of happy clients"
            ),
            SiteConfig(
                key="stat_expertise_years",
                value_text="5",
                category="stats",
                description="Years of expertise"
            ),
            SiteConfig(
                key="stat_team_members",
                value_text="8",
                category="stats",
                description="Professional team members"
            ),
            SiteConfig(
                key="stat_reviews",
                value_text="200",
                category="stats",
                description="5-star reviews"
            ),
            
            # Tours Section
            SiteConfig(
                key="tours_title",
                value_text="Choose Your Perfect Tuk Tuk Tour",
                category="tours",
                description="Tours section title"
            ),
            SiteConfig(
                key="tours_description",
                value_text="Whether you want to explore majestic palaces or ride along dramatic coastal roads, our tuk tuk tours offer the perfect match — from half-day highlights to full-day adventures. Choose what inspires you most.",
                category="tours",
                description="Tours section description"
            ),
            
            # Testimonials
            SiteConfig(
                key="testimonials_title",
                value_text="What Travelers Say About Our Tuk Tuk Tours",
                category="testimonials",
                description="Testimonials section title"
            ),
            SiteConfig(
                key="testimonials_description",
                value_text="Over the years, couples, families, and travelers of all ages have explored Sintra & Cascais with us — and their words say it all. See why so many guests recommend Yes, You Deserve! and come back for more.",
                category="testimonials",
                description="Testimonials section description"
            ),
            SiteConfig(
                key="testimonial_1_text",
                value_text="Best part of our Portugal trip! Daniel made us feel like locals and took us to places we'll never forget.",
                category="testimonials",
                description="Testimonial 1 text"
            ),
            SiteConfig(
                key="testimonial_1_author",
                value_text="Sarah & Mark, USA",
                category="testimonials",
                description="Testimonial 1 author"
            ),
            
            # Why Choose Section
            SiteConfig(
                key="why_choose_title",
                value_text="Why Travelers Choose Yes, You Deserve!",
                category="why_choose",
                description="Why choose section title"
            ),
            SiteConfig(
                key="why_reason_1_title",
                value_text="Only Private Tours",
                category="why_choose",
                description="Reason 1 title"
            ),
            SiteConfig(
                key="why_reason_1_description",
                value_text="No groups, no strangers. Just you and your guide.",
                category="why_choose",
                description="Reason 1 description"
            ),
            SiteConfig(
                key="why_reason_2_title",
                value_text="Custom Planning",
                category="why_choose",
                description="Reason 2 title"
            ),
            SiteConfig(
                key="why_reason_2_description",
                value_text="We adapt the day to your rhythm and interests.",
                category="why_choose",
                description="Reason 2 description"
            ),
            SiteConfig(
                key="why_reason_3_title",
                value_text="Expert Guides",
                category="why_choose",
                description="Reason 3 title"
            ),
            SiteConfig(
                key="why_reason_3_description",
                value_text="Passionate locals trained to make you feel at home.",
                category="why_choose",
                description="Reason 3 description"
            ),
            SiteConfig(
                key="why_reason_4_title",
                value_text="Last Generation Tuk Tuks",
                category="why_choose",
                description="Reason 4 title"
            ),
            SiteConfig(
                key="why_reason_4_description",
                value_text="Explore in style with our spacious, electric tuk tuk.",
                category="why_choose",
                description="Reason 4 description"
            ),
            SiteConfig(
                key="why_reason_5_title",
                value_text="Beautiful Photos Included",
                category="why_choose",
                description="Reason 5 title"
            ),
            SiteConfig(
                key="why_reason_5_description",
                value_text="Leave with stunning photos and memories captured during your adventure.",
                category="why_choose",
                description="Reason 5 description"
            ),
            
            # Contact Section
            SiteConfig(
                key="contact_title",
                value_text="Ready to Plan Your Unforgettable Trip?",
                category="contact",
                description="Contact section title"
            ),
            SiteConfig(
                key="contact_description",
                value_text="Let's make your dream tour a reality. Whether you have questions or are ready to book, we're here to help you every step of the way.",
                category="contact",
                description="Contact section description"
            ),
            SiteConfig(
                key="contact_whatsapp_title",
                value_text="WhatsApp",
                category="contact",
                description="WhatsApp contact title"
            ),
            SiteConfig(
                key="contact_whatsapp_description",
                value_text="Fastest way to reach us. Click below to start chatting now.",
                category="contact",
                description="WhatsApp contact description"
            ),
            SiteConfig(
                key="contact_whatsapp_url",
                value_text="http://wa.link/y0m3y9",
                category="contact",
                description="WhatsApp contact URL"
            ),
            SiteConfig(
                key="contact_messenger_title",
                value_text="Messenger",
                category="contact",
                description="Messenger contact title"
            ),
            SiteConfig(
                key="contact_messenger_description",
                value_text="Prefer Facebook? We're available there too.",
                category="contact",
                description="Messenger contact description"
            ),
            SiteConfig(
                key="contact_messenger_url",
                value_text="https://www.m.me/1566043420168290",
                category="contact",
                description="Messenger contact URL"
            ),
            SiteConfig(
                key="contact_email_title",
                value_text="Email",
                category="contact",
                description="Email contact title"
            ),
            SiteConfig(
                key="contact_email_description",
                value_text="For detailed inquiries or special requests.",
                category="contact",
                description="Email contact description"
            ),
            SiteConfig(
                key="contact_email_address",
                value_text="info@yesyoudeserve.tours",
                category="contact",
                description="Email contact address"
            ),
            
            # Lead Form
            SiteConfig(
                key="lead_form_title",
                value_text="Let's plan your trip?",
                category="lead_form",
                description="Lead form title"
            ),
            SiteConfig(
                key="lead_form_description",
                value_text="Ready for your unforgettable trip? Just a few details below, and then you can select your preferred way to connect with us!",
                category="lead_form",
                description="Lead form description"
            ),
            SiteConfig(
                key="lead_form_privacy_text",
                value_text="Rest assured, we value your privacy and will not send unsolicited emails.",
                category="lead_form",
                description="Lead form privacy notice"
            ),
        ]
        
        # Add all configs (skip if already exists)
        for config in configs:
            existing = db.query(SiteConfig).filter(SiteConfig.key == config.key).first()
            if not existing:
                db.add(config)
        
        # Add media assets
        media_assets = [
            MediaAsset(
                key="hero_video",
                type="video",
                url="https://youtu.be/N3takXF4Lx8?feature=shared",
                alt_text="ABC Good Morning America featuring YYD Tours",
                category="hero",
                meta_data={"platform": "youtube"}
            ),
            MediaAsset(
                key="hero_background_image",
                type="image",
                url="https://www.yesyoudeserve.tours/wp-content/uploads/2024/12/455008490_3746777955570159_2441046116986882405_n.webp",
                alt_text="Sintra landscape tuk tuk tour",
                category="hero"
            ),
            MediaAsset(
                key="abc_gma_logo",
                type="image",
                url="https://www.yesyoudeserve.tours/wp-content/uploads/2025/01/good-morning-america-abc.png",
                alt_text="ABC Good Morning America logo",
                category="awards"
            ),
        ]
        
        for media in media_assets:
            existing = db.query(MediaAsset).filter(MediaAsset.key == media.key).first()
            if not existing:
                db.add(media)
        
        # Create admin user if doesn't exist
        admin_email = "admin@yesyoudeserve.tours"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                full_name="YYD Admin",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
        
        db.commit()
        print("✅ YYD site configuration seeded successfully!")
        print(f"📝 Inserted {len(configs)} configs")
        print(f"🖼️ Inserted {len(media_assets)} media assets")
        print(f"👤 Admin user created: {admin_email} / yyd2025admin")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_site_config()
