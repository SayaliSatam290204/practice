import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    FaArrowLeft,
    FaArrowRight,
    FaHeart,
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaStar,
    FaBolt,
    FaLeaf,
    FaTint,
    FaSun,
    FaSeedling,
    FaTruck,
    FaHome,
} from "react-icons/fa";

import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../hooks/useAuth";
import RecommendedPlants from "../components/plants/RecommendedPlants";
import PlantImagePlaceholder from "../components/plants/PlantImagePlaceholder";

const PlantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const { cartItems, addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [hasPurchased, setHasPurchased] = useState(false);
    
    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewStatus, setReviewStatus] = useState({ loading: false, error: "", success: "" });

    /* =========================
       FETCH PLANT
    ========================== */

    useEffect(() => {
        const fetchPlant = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/plants/${id}`);
                const plantData = response.data?.plant || response.data;
                setPlant(plantData);
            } catch (err) {
                console.error("Failed to fetch plant:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load plant details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlant();
        }
    }, [id]);

    /* =========================
       FETCH REVIEWS & PURCHASE STATUS
    ========================== */

    useEffect(() => {
        const fetchReviewsAndOrders = async () => {
            if (!id) return;
            
            try {
                setLoadingReviews(true);
                
                // Fetch reviews
                const reviewRes = await api.get(`/reviews/plant/${id}`);
                setReviews(reviewRes.data);
                
                // Check if user purchased the plant
                if (isAuthenticated) {
                    const orderRes = await api.get('/orders/my-orders');
                    const orders = orderRes.data;
                    
                    const purchased = orders.some(order => 
                        order.items.some(item => 
                            item.plant && (item.plant._id === id || item.plant === id)
                        )
                    );
                    
                    setHasPurchased(purchased);
                }
            } catch (err) {
                console.error("Failed to fetch reviews/orders:", err);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviewsAndOrders();
    }, [id, isAuthenticated]);

    /* =========================
       SUBMIT REVIEW
    ========================== */

    const submitReview = async (e) => {
        e.preventDefault();
        if (!plant) return;
        
        try {
            setReviewStatus({ loading: true, error: "", success: "" });
            await api.post("/reviews/create", {
                plant: plant._id || id,
                rating,
                comment
            });
            setReviewStatus({ loading: false, error: "", success: "Review submitted successfully and is pending approval!" });
            setRating(5);
            setComment("");
        } catch (err) {
            setReviewStatus({ 
                loading: false, 
                error: err.response?.data?.message || "Failed to submit review.", 
                success: "" 
            });
        }
    };

    /* =========================
       LOADING
    ========================== */

    if (loading) {
        return (
            <main className="plant-details-page">
                <div className="plant-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading plant details...</p>
                </div>
            </main>
        );
    }

    /* =========================
       ERROR
    ========================== */

    if (error || !plant) {
        return (
            <main className="plant-details-page">
                <section className="plant-details-error">
                    <FaLeaf />
                    <h1>Plant Not Found</h1>
                    <p>
                        {error ||
                            "The plant you're looking for does not exist."}
                    </p>
                    <Link
                        to="/plants"
                        className="primary-button"
                    >
                        <FaArrowLeft />
                        Back to Plants
                    </Link>
                </section>
            </main>
        );
    }

    /* =========================
       PRICE
    ========================== */

    const hasDiscount =
        plant.discountPrice &&
        plant.discountPrice < plant.price;

    const displayPrice = hasDiscount ? plant.discountPrice : plant.price;

    /* =========================
       STOCK
    ========================== */

    const stock = Number(plant.stock) || 0;
    const isOutOfStock = stock <= 0;

    /* =========================
       WISHLIST
    ========================== */

    const wishlisted = isInWishlist(plant._id);

    /* =========================
       QUANTITY
    ========================== */

    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };

    const increaseQuantity = () => {
        setQuantity((current) => Math.min(stock, current + 1));
    };

    /* =========================
       ADD TO CART
    ========================== */

    const isAlreadyInCart = cartItems?.some(item => item._id === (plant?._id || plant?.id));

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isAlreadyInCart) {
            navigate('/cart');
            return;
        }

        if (isOutOfStock) {
            return;
        }

        addToCart(plant, quantity);
        setAddedToCart(true);

        setTimeout(() => {
            setAddedToCart(false);
        }, 1500);
    };

    /* =========================
       BUY NOW
    ========================== */

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isOutOfStock) {
            return;
        }

        addToCart(plant, quantity);
        navigate("/cart");
    };

    /* =========================
       WISHLIST
    ========================== */

    const handleWishlist = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        toggleWishlist(plant);
    };

    return (
        <main className="plant-details-page">
            {/* =========================
                BACK LINK
            ========================== */}

            <div className="plant-details-container">
                <Link to="/plants" className="back-to-plants">
                    <FaArrowLeft />
                    Back to Plants
                </Link>

                {/* =========================
                    PRODUCT
                ========================== */}

                <section className="plant-details">
                    {/* =========================
                        IMAGE
                    ========================== */}

                    <div className="plant-details-image-section">
                        <div className="plant-details-image-wrapper">
                            {(!plant.image || plant.image.includes('placehold.co') || plant.image.includes('via.placeholder.com')) ? (
                                <PlantImagePlaceholder className="plant-details-image" />
                            ) : (
                                <img
                                    src={plant.image}
                                    alt={plant.name}
                                    className="plant-details-image"
                                />
                            )}

                            {hasDiscount && (
                                <span className="details-sale-badge">
                                    Sale
                                </span>
                            )}

                            <button
                                type="button"
                                className={`details-wishlist-button ${
                                    wishlisted ? "active" : ""
                                }`}
                                onClick={handleWishlist}
                                aria-label={
                                    wishlisted
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                }
                            >
                                <FaHeart />
                            </button>
                        </div>
                    </div>

                    {/* =========================
                        INFORMATION
                    ========================== */}

                    <div className="plant-details-info">
                        {/* Category */}

                        {plant.category && (
                            <span className="details-category">
                                {plant.category}
                            </span>
                        )}

                        {/* Name */}

                        <h1>{plant.name}</h1>

                        {/* Scientific name */}

                        {plant.scientificName && (
                            <p className="details-scientific-name">
                                {plant.scientificName}
                            </p>
                        )}

                        {/* Rating */}

                        <div className="details-rating">
                            <div className="rating-stars" style={{ color: '#f59e0b', display: 'flex', gap: '2px' }}>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < Math.round(reviews.length > 0 ? (reviews.reduce((a,c) => a + c.rating, 0) / reviews.length) : (plant.rating || 0)) ? "#f59e0b" : "#e5e7eb"} />
                                ))}
                            </div>
                            <span>
                                {reviews.length > 0 
                                    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
                                    : (plant.rating ? Number(plant.rating).toFixed(1) : "0.0")}
                                <span style={{color: '#6b7280', fontSize: '14px', marginLeft: '8px'}}>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                            </span>
                        </div>

                        {/* Price */}

                        <div className="details-price">
                            <span>₹{displayPrice}</span>

                            {hasDiscount && <del>₹{plant.price}</del>}
                        </div>

                        {/* Stock */}

                        <div className="details-stock">
                            {isOutOfStock ? (
                                <span className="out-of-stock">
                                    Out of Stock
                                </span>
                            ) : (
                                <span className="in-stock">
                                    {stock <= 5
                                        ? `Only ${stock} left in stock`
                                        : "In Stock"}
                                </span>
                            )}
                        </div>

                        {/* Description */}

                        {plant.description && (
                            <div className="details-description">
                                <h2>About this plant</h2>
                                <p>{plant.description}</p>
                            </div>
                        )}

                        {/* =========================
                            CARE INFORMATION
                        ========================== */}

                        <div className="plant-care-grid">
                            {plant.sunlight && (
                                <div className="care-item">
                                    <FaSun />
                                    <div>
                                        <strong>Sunlight</strong>
                                        <span>{plant.sunlight}</span>
                                    </div>
                                </div>
                            )}

                            {plant.waterRequirement && (
                                <div className="care-item">
                                    <FaTint />
                                    <div>
                                        <strong>Water</strong>
                                        <span>
                                            {plant.waterRequirement}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {plant.careLevel && (
                                <div className="care-item">
                                    <FaSeedling />
                                    <div>
                                        <strong>Care Level</strong>
                                        <span>{plant.careLevel}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* =========================
                            QUANTITY
                        ========================== */}

                        {!isOutOfStock && (
                            <div className="details-quantity">
                                <span>Quantity</span>

                                <div className="quantity-control">
                                    <button
                                        type="button"
                                        onClick={decreaseQuantity}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <FaMinus />
                                    </button>

                                    <span>{quantity}</span>

                                    <button
                                        type="button"
                                        onClick={increaseQuantity}
                                        disabled={quantity >= stock}
                                        aria-label="Increase quantity"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =========================
                            ACTIONS
                        ========================== */}

                        <div className="details-actions">
                            {/* Add Cart */}

                            <button
                                type="button"
                                className="details-cart-button"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || !isAuthenticated}
                                title={isAuthenticated ? "Add to cart" : "Login to add to cart"}
                            >
                                <FaShoppingCart />

                                {isAlreadyInCart
                                    ? "Go to Cart"
                                    : addedToCart
                                    ? "Added to Cart"
                                    : "Add to Cart"}
                            </button>

                            {/* Buy Now */}

                            <button
                                type="button"
                                className="details-buy-button"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock || !isAuthenticated}
                                title={isAuthenticated ? "Buy now" : "Login to buy"}
                            >
                                <FaBolt />
                                Buy Now
                                <FaArrowRight />
                            </button>
                        </div>

                        {/* Wishlist Link */}

                        <button
                            type="button"
                            className={`details-wishlist-link ${
                                wishlisted ? "active" : ""
                            }`}
                            onClick={handleWishlist}
                        >
                            <FaHeart />
                            {wishlisted
                                ? "Remove from Wishlist"
                                : "Add to Wishlist"}
                        </button>
                    </div>
                </section>

                {/* =========================
                    ADDITIONAL INFORMATION
                ========================== */}

                <section className="plant-extra-info">
                    <div>
                        <FaLeaf />
                        <h3>Healthy Plants</h3>
                        <p>
                            Carefully selected plants
                            for your home and garden.
                        </p>
                    </div>

                    <div>
                        <FaTruck />
                        <h3>Safe Delivery</h3>
                        <p>
                            Plants are packed carefully
                            for safe delivery.
                        </p>
                    </div>

                    <div>
                        <FaHome />
                        <h3>Easy Care</h3>
                        <p>
                            Get the information you need
                            to care for your plant.
                        </p>
                    </div>
                </section>

                {/* =========================
                    REVIEWS SECTION
                ========================== */}

                <section className="plant-reviews-section">
                    <h2>Customer Reviews</h2>
                    
                    {loadingReviews ? (
                        <p>Loading reviews...</p>
                    ) : (
                        <>
                            <div className="reviews-summary">
                                <div className="average-rating">
                                    {reviews.length > 0 
                                        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
                                        : (plant.rating ? Number(plant.rating).toFixed(1) : "0.0")}
                                </div>
                                <div>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} color={i < Math.round(reviews.length > 0 ? (reviews.reduce((a,c) => a + c.rating, 0) / reviews.length) : (plant.rating || 0)) ? "#f59e0b" : "#e5e7eb"} />
                                        ))}
                                    </div>
                                    <div className="review-count">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                                </div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="review-list">
                                    {reviews.map(review => (
                                        <div key={review._id} className="review-card">
                                            <div className="review-card-header">
                                                <div>
                                                    <h4>{review.user?.name || 'Anonymous User'}</h4>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} color={i < review.rating ? "#f59e0b" : "#e5e7eb"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="review-card-date">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <p className="review-card-comment">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ marginBottom: '40px', color: '#6b7280' }}>No reviews yet. Be the first to review this plant!</p>
                            )}

                            {/* Write Review Form */}
                            <div className="review-form-container">
                                <h3>Write a Review</h3>
                                {!isAuthenticated ? (
                                    <div className="write-review-prompt">
                                        <p>You must be logged in to write a review.</p>
                                        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '10px' }}>Login</Link>
                                    </div>
                                ) : !hasPurchased ? (
                                    <div className="write-review-prompt">
                                        <p>You can only review plants that you have purchased and received.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={submitReview}>
                                        <div className="review-form-group">
                                            <label>Rating</label>
                                            <div className="star-selector">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className={rating >= star ? 'active' : ''}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        <FaStar />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="review-form-group">
                                            <label htmlFor="comment">Your Review</label>
                                            <textarea 
                                                id="comment"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="What did you like or dislike about this plant?"
                                                required
                                            ></textarea>
                                        </div>

                                        {reviewStatus.error && <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>{reviewStatus.error}</div>}
                                        {reviewStatus.success && <div style={{ color: 'var(--primary)', marginBottom: '15px', padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '5px' }}>{reviewStatus.success}</div>}

                                        <button 
                                            type="submit" 
                                            className="btn-primary" 
                                            disabled={reviewStatus.loading || reviewStatus.success}
                                            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                                        >
                                            {reviewStatus.loading ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </section>
                
                {/* =========================
                    RECOMMENDED PLANTS
                ========================== */}
                <section style={{ padding: '0 20px', marginBottom: '40px' }}>
                    <RecommendedPlants currentPlantId={plant._id} category={plant.category} />
                </section>
                
            </div>
        </main>
    );
};

export default PlantDetails;
