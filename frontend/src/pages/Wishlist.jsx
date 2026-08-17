import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

import {
    FaHeart,
    FaShoppingCart,
    FaTrash,
    FaLeaf,
    FaArrowLeft,
    FaEye,
    FaStar,
} from "react-icons/fa";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";


const Wishlist = () => {

    const {
        wishlistItems,
        wishlistCount,
        removeFromWishlist,
        clearWishlist,
    } = useWishlist();

    const {
        addToCart,
    } = useCart();


    // Add wishlist item to cart
    const handleAddToCart = (plant) => {
        if (!plant || plant.stock <= 0) {
            return;
        }
        addToCart(plant, 1);
        toast.success(`${plant.name} added to cart!`);
    };

    const handleAddAllToCart = () => {
        let addedCount = 0;
        wishlistItems.forEach(plant => {
            if (plant.stock > 0) {
                addToCart(plant, 1);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            toast.success("Added available wishlist items to cart!");
        }
    };


    // Empty wishlist
    if (wishlistItems.length === 0) {

        return (

            <main className="wishlist-page">

                <section className="empty-state-container">
                    <div className="empty-state-icon">
                        <FaHeart />
                    </div>
                    <h1>Your Wishlist is Empty</h1>
                    <p>Save your favorite plants here and come back to them anytime.</p>
                    <Link to="/plants" className="primary-button">
                        <FaLeaf style={{ marginRight: '8px' }} /> Explore Plants
                    </Link>
                </section>

            </main>

        );

    }


    return (

        <main className="wishlist-page">


            {/* =========================
                HEADER
            ========================== */}

            <section className="wishlist-header">
                <div className="wishlist-header-content">
                    <div>
                        <span className="wishlist-eyebrow">Plant Nursery</span>
                        <h1>My Wishlist</h1>
                        <p>Your favorite plants, all in one place.</p>
                    </div>
                    <div className="wishlist-count-badge">
                        <FaHeart />
                        <span>{wishlistCount} {wishlistCount === 1 ? "plant" : "plants"}</span>
                    </div>
                </div>

                <div className="wishlist-header-actions">
                    <button className="btn-secondary btn-sm" onClick={clearWishlist}>
                        <FaTrash /> Clear Wishlist
                    </button>
                    <button className="btn-primary btn-sm" onClick={handleAddAllToCart}>
                        <FaShoppingCart /> Add All to Cart
                    </button>
                </div>
            </section>


            {/* =========================
                WISHLIST GRID
            ========================== */}

            <section className="wishlist-grid">

                {wishlistItems.map((plant) => {

                    const hasDiscount =
                        plant.discountPrice &&
                        plant.discountPrice <
                            plant.price;


                    const displayPrice =
                        hasDiscount
                            ? plant.discountPrice
                            : plant.price;


                    const isOutOfStock =
                        !plant.stock ||
                        plant.stock <= 0;


                    return (

                        <article
                            key={plant._id}
                            className="plant-card wishlist-card-enhanced"
                        >

                            {/* Image */}
                            <div className="plant-image-container">
                                <Link to={`/plants/${plant._id}`}>
                                    <img src={plant.image} alt={plant.name} className="plant-image" />
                                </Link>

                                {/* Remove Button Overlay */}
                                <button
                                    type="button"
                                    className="remove-wishlist-button"
                                    onClick={() => removeFromWishlist(plant._id)}
                                    aria-label={`Remove ${plant.name} from wishlist`}
                                    title="Remove from wishlist"
                                >
                                    <FaTrash />
                                </button>

                                {hasDiscount && (
                                    <span className="discount-badge">Sale</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="plant-content">
                                {plant.category && (
                                    <span className="plant-category">{plant.category}</span>
                                )}

                                <Link to={`/plants/${plant._id}`} className="plant-title-link">
                                    <h3 className="plant-title">{plant.name}</h3>
                                </Link>

                                {/* Rating */}
                                <div className="plant-rating">
                                    <FaStar />
                                    <span>{plant.rating ? Number(plant.rating).toFixed(1) : "0.0"}</span>
                                </div>

                                {/* Price */}
                                <div className="plant-price-container">
                                    <span className="plant-price">₹{displayPrice}</span>
                                    {hasDiscount && (
                                        <span className="plant-price-original">₹{plant.price}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="wishlist-actions-row">
                                    <button
                                        type="button"
                                        className="btn-primary w-full"
                                        onClick={() => handleAddToCart(plant)}
                                        disabled={isOutOfStock}
                                    >
                                        <FaShoppingCart style={{ marginRight: '8px' }} />
                                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        </article>

                    );

                })}

            </section>


            {/* Continue Shopping */}

            <div className="wishlist-footer">

                <Link
                    to="/plants"
                    className="continue-shopping"
                >

                    <FaArrowLeft />

                    Continue Shopping

                </Link>

            </div>

        </main>

    );

};


export default Wishlist;