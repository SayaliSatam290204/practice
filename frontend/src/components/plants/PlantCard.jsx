import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    FaHeart,
    FaShoppingCart,
    FaStar,
    FaEye,
    FaBolt,
    FaRegHeart
} from 'react-icons/fa';

import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../hooks/useAuth';
import PlantImagePlaceholder from './PlantImagePlaceholder';

const PlantCard = ({ plant }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const {
        cartItems,
        addToCart
    } = useCart();

    const {
        toggleWishlist,
        isInWishlist,
    } = useWishlist();

    const [addedToCart, setAddedToCart] = useState(false);

    if (!plant) {
        return null;
    }

    //Price
    const hasDiscount =
        plant.discountPrice &&
        plant.discountPrice < plant.price;

    const displayPrice = hasDiscount
        ? plant.discountPrice
        : plant.price;

    //Wishlist status
    const wishlisted = isInWishlist(plant._id);

    //Stock
    const isOutOfStock = !plant.stock || plant.stock <= 0;

    //Added to cart
    const isAlreadyInCart = cartItems?.some(item => item._id === (plant._id || plant.id));

    const handleAddedToCart = () => {

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

        addToCart(plant, 1);

        setAddedToCart(true);

        setTimeout(() => {
            setAddedToCart(false);
        }, 1500);
    };

    //Buy Now
    const handleBuyNow = () => {

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isOutOfStock) {
            return;
        }

        /*
         * Add the plant to cart first.
         * Later, when Checkout is implemented,
         * this will directly take the user
         * to the checkout page.
         */

        addToCart(plant, 1);

        navigate('/cart');
    };

    //Wishlist
    const handleWishlist = (e) => {
        e.preventDefault(); // Prevent default if wrapped in a link
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        toggleWishlist(plant);
    };

    const isPlaceholderImage = !plant.image || plant.image.includes('placehold.co') || plant.image.includes('via.placeholder.com');

    return (

        <article className="plant-card">


            {/* =========================
                IMAGE SECTION
            ========================== */}

            <div className="plant-image-container">

                <Link
                    to={`/plants/${plant._id}`}
                    className="plant-image-link"
                >

                    {isPlaceholderImage ? (
                        <PlantImagePlaceholder className="plant-image" />
                    ) : (
                        <img
                            src={plant.image}
                            alt={plant.name}
                            className="plant-image"
                        />
                    )}

                </Link>

                {/* Discount */}

                {hasDiscount && (

                    <span className="discount-badge">
                        Sale
                    </span>

                )}


                {/* Wishlist */}

                <button
                    type="button"
                    className={`wishlist-button ${wishlisted
                            ? "active"
                            : ""
                        }`}
                    onClick={handleWishlist}
                    aria-label={
                        wishlisted
                            ? `Remove ${plant.name} from wishlist`
                            : `Add ${plant.name} to wishlist`
                    }
                >

                    {wishlisted ? <FaHeart /> : <FaRegHeart />}

                </button>

            </div>


            {/* =========================
                CARD CONTENT
            ========================== */}

            <div className="plant-card-content">


                {/* Category */}

                {plant.category && (

                    <span className="plant-category">
                        {plant.category}
                    </span>

                )}


                {/* Name */}

                <Link
                    to={`/plants/${plant._id}`}
                    className="plant-name-link"
                >

                    <h3 className="plant-name">
                        {plant.name}
                    </h3>

                </Link>


                {/* Scientific name */}

                {plant.scientificName && (

                    <p className="plant-scientific-name">
                        {plant.scientificName}
                    </p>

                )}


                {/* Rating */}

                <div className="plant-rating">

                    <FaStar />

                    <span>
                        {plant.rating
                            ? Number(
                                plant.rating
                            ).toFixed(1)
                            : "0.0"}
                    </span>

                </div>


                {/* =========================
                    PRICE
                ========================== */}

                <div className="plant-price">

                    <span className="current-price">
                        ₹{displayPrice}
                    </span>


                    {hasDiscount && (

                        <span className="original-price">
                            ₹{plant.price}
                        </span>

                    )}

                </div>


                {/* =========================
                    STOCK
                ========================== */}

                <div className="plant-stock">

                    {isOutOfStock ? (

                        <span className="out-of-stock">
                            Out of Stock
                        </span>

                    ) : (

                        <span className="in-stock">

                            {plant.stock <= 5
                                ? `Only ${plant.stock} left`
                                : "In Stock"}

                        </span>

                    )}

                </div>


                {/* =========================
                    ACTIONS
                ========================== */}

                <div className="plant-card-actions">


                    {/* View Details */}

                    <Link
                        to={`/plants/${plant._id}`}
                        className="view-plant-button"
                        title="View plant details"
                    >

                        <FaEye />

                        <span>
                            Details
                        </span>

                    </Link>


                    {/* Add to Cart */}

                    <button
                        type="button"
                        className="cart-button"
                        onClick={handleAddedToCart}
                        disabled={isOutOfStock || !isAuthenticated}
                        title={isAuthenticated ? "Add to cart" : "Login to add to cart"}
                    >

                        <FaShoppingCart />

                        <span>
                            {isAlreadyInCart
                                ? "Go to Cart"
                                : addedToCart
                                ? "Added"
                                : "Add"}
                        </span>

                    </button>


                    {/* Buy Now */}

                    <button
                        type="button"
                        className="buy-now-button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock || !isAuthenticated}
                        title={isAuthenticated ? "Buy now" : "Login to buy"}
                    >

                        <FaBolt />

                        <span>
                            Buy Now
                        </span>

                    </button>

                </div>

            </div>

        </article>

    );
};

export default PlantCard;