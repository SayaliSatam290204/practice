import { Link } from 'react-router-dom';
import {
    FaSeedling,
    FaTruck,
    FaHandHoldingHeart,
    FaArrowRight,
    FaLeaf,
    FaUsers,
    FaStar,
    FaBoxOpen,
    FaCheckCircle,
    FaShoppingCart,
    FaRegHeart,
    FaHeart
} from 'react-icons/fa';

import { landingPageContent } from './data/landingPageContent';
import { useState, useEffect } from 'react';
import api from './services/api';
import PlantCard from './components/plants/PlantCard';

const Home = () => {
    const { 
        hero, 
        stats, 
        categories, 
        promoBanner, 
        testimonials, 
        newsletter, 
        blogTeasers, 
        trustBadges, 
        footer 
    } = landingPageContent;

    const [featuredPlants, setFeaturedPlants] = useState([]);

    useEffect(() => {
        const fetchFeaturedPlants = async () => {
            try {
                const response = await api.get('/plants');
                const plantData = response.data?.plants || response.data?.data || response.data;
                
                if (Array.isArray(plantData)) {
                    // Just take the first 6 for featured section
                    setFeaturedPlants(plantData.slice(0, 6));
                }
            } catch (err) {
                console.error("Failed to fetch featured plants:", err);
            }
        };

        fetchFeaturedPlants();
    }, []);

    return (
        <main className='home-page' style={{ padding: 0 }}>
            {/* Updated Hero Section */}
            <section className="hero-section">
                <div className="hero-content-left">
                    <h1 className="hero-heading">{hero.heading}</h1>
                    <p className="hero-subtext">
                        {hero.subtext}
                    </p>
                    <Link to="/plants" className="hero-cta">
                        {hero.ctaLabel} <FaArrowRight />
                    </Link>
                </div>
                <div className="hero-image-right">
                    <img src="/hero-bg.jpg" alt="Vrukshavalli Nursery Plants" />
                </div>
            </section>

            {/* Existing Floating Stats Bar */}
            <div className="stats-bar">
                {stats.map((stat, index) => {
                    const Icon = [FaBoxOpen, FaStar, FaLeaf, FaUsers][index % 4];
                    return (
                        <div key={index} className="stat-card">
                            <Icon className="stat-icon" />
                            <span className="stat-number">{stat.metric}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Existing Main Content / Features */}
            <div className='home-content'>
                <h2 className="section-heading">Why Shop With Us?</h2>
                <p className="section-subheading">We are committed to providing the best plants and services.</p>

                <div className="home-features">
                    <div className="home-feature">
                        <FaSeedling className="home-feature-icon" />
                        <h3>Fresh Plants</h3>
                        <p>Hand-picked and healthy, delivered straight from our nursery to your living room.</p>
                    </div>

                    <div className="home-feature">
                        <FaTruck className="home-feature-icon" />
                        <h3>Fast Delivery</h3>
                        <p>Careful packaging ensures your plants arrive safe, healthy, and thriving.</p>
                    </div>

                    <div className="home-feature">
                        <FaHandHoldingHeart className="home-feature-icon" />
                        <h3>Expert Care Tips</h3>
                        <p>Access our comprehensive guides and support to help your plants grow for years to come.</p>
                    </div>
                </div>
            </div>

            {/* NEW SECTIONS */}

            {/* Trust Badges Strip */}
            <div className="trust-badges-strip">
                {trustBadges.map((badge, index) => (
                    <div key={index} className="trust-badge-item">
                        <FaCheckCircle />
                        <span>{badge}</span>
                    </div>
                ))}
            </div>

            {/* Category Banners - Asymmetric */}
            <section className="categories-section" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
                <h2 className="section-heading">Shop by Collection</h2>
                <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                    {categories.map((cat, index) => (
                        <div key={index} className="category-card" style={{ 
                            background: index % 2 === 0 ? 'var(--primary-light)' : 'var(--accent-light)',
                            padding: '40px',
                            borderRadius: index % 2 === 0 ? '0 40px 0 40px' : '40px 0 40px 0',
                            border: 'none',
                            boxShadow: 'none'
                         }}>
                            <h3 style={{ fontFamily: 'var(--heading)', fontSize: '24px', color: 'var(--text-h)', marginBottom: '12px' }}>{cat.title}</h3>
                            <p style={{ color: 'var(--text)' }}>{cat.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Plants Preview */}
            <section className="featured-plants-section">
                <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '40px' }}>Featured Plants</h2>
                
                {/* Reusing existing styling patterns from /plants grid */}
                <div className="plants-grid">
                    {featuredPlants.length > 0 ? (
                        featuredPlants.map((plant) => (
                            <PlantCard key={plant._id} plant={plant} />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#94a3b8' }}>
                            Loading featured plants...
                        </p>
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Link to="/plants" className="home-cta" style={{ background: '#f8f9fa', color: '#2c3e50', border: '1px solid #dee2e6' }}>
                        View All Plants <FaArrowRight />
                    </Link>
                </div>
            </section>

            {/* Seasonal Promo Banner */}
            <section className="promo-banner">
                <h2>{promoBanner.headline}</h2>
                <p>{promoBanner.subtext}</p>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <h2 className="section-heading">What Our Customers Say</h2>
                <div className="testimonials-grid">
                    {testimonials.map((test, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(Math.floor(test.rating))].map((_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </div>
                            <p className="testimonial-quote">"{test.quote}"</p>
                            <p className="testimonial-name">— {test.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Blog Teasers & Newsletter */}
            <section className="blog-newsletter-container">
                <div className="blog-teasers">
                    <h2 className="section-heading">Plant Care & Tips</h2>
                    <div className="blog-grid">
                        {blogTeasers.map((blog, index) => (
                            <div key={index} className="blog-card">
                                <h4>{blog.title}</h4>
                                <p>{blog.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="newsletter-section">
                    <h3>{newsletter.heading}</h3>
                    <p>{newsletter.supportingLine}</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email address" required />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-col">
                        <h3>Vrukshavalli Nursery</h3>
                        <p>{footer.tagline}</p>
                    </div>
                    <div className="footer-col">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            {footer.quickLinks.map((link, index) => (
                                <li key={index}><Link to="#">{link}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Contact Us</h3>
                        <p><strong>Email:</strong> {footer.contactInfo.email}</p>
                        <p><strong>Phone:</strong> {footer.contactInfo.phone}</p>
                        <p><strong>Address:</strong> {footer.contactInfo.address}</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Vrukshavalli Nursery. All rights reserved.</p>
                </div>
            </footer>

        </main>
    )
};

export default Home;