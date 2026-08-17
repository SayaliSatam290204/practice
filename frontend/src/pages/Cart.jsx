import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import { useCart } from '../context/CartContext';
import { FaShieldAlt, FaShoppingBag, FaPlus, FaMinus } from 'react-icons/fa';
import RecommendedPlants from '../components/plants/RecommendedPlants';

const Cart = () => {
    const navigate = useNavigate();
    const { 
        cartItems, 
        cartCount, 
        cartSubtotal, 
        removeFromCart, 
        increaseQuantity, 
        decreaseQuantity,
        getItemPrice 
    } = useCart();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <main className="fk-cart-page">
                <section className="empty-state-container">
                    <div className="empty-state-icon"><FaShoppingBag /></div>
                    <h1>Your Cart is Empty</h1>
                    <p>Add some items to it now.</p>
                    <Link to="/plants" className="primary-button" style={{ marginTop: '16px' }}>
                        Shop Now
                    </Link>
                </section>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
                    <RecommendedPlants />
                </div>
            </main>
        );
    }

    return (
        <div className="fk-cart-page">
            <main className="fk-cart-main">
                <div className="fk-cart-layout">
                    
                    {/* LEFT COLUMN: Items and Recommendations */}
                    <div className="fk-cart-left">
                        
                        <div className="fk-cart-items-container">
                            {cartItems.map((item) => (
                                <div key={item._id} className="fk-cart-item">
                                    <div className="fk-cart-item-image-col">
                                        <div className="fk-cart-item-image">
                                            <Link to={`/plants/${item._id}`}>
                                                <img src={item.image} alt={item.name} />
                                            </Link>
                                        </div>
                                        <div className="fk-cart-qty-controls">
                                            <button 
                                                className="fk-qty-btn-circle" 
                                                onClick={() => decreaseQuantity(item._id)} 
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <div className="fk-qty-value">{item.quantity}</div>
                                            <button 
                                                className="fk-qty-btn-circle" 
                                                onClick={() => increaseQuantity(item._id)} 
                                                disabled={item.quantity >= (item.stock || 10)}
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="fk-cart-item-details-col">
                                        <Link to={`/plants/${item._id}`} className="fk-cart-item-name">
                                            {item.name}
                                        </Link>
                                        {item.category && <div className="fk-cart-item-category">Category: {item.category}</div>}
                                        
                                        <div className="fk-cart-item-price-row">
                                            {item.price > getItemPrice(item) && (
                                                <del className="fk-cart-item-mrp">₹{item.price}</del>
                                            )}
                                            <span className="fk-cart-item-current-price">₹{getItemPrice(item)}</span>
                                            {item.price > getItemPrice(item) && (
                                                <span className="fk-cart-item-discount">
                                                    {Math.round(((item.price - getItemPrice(item)) / item.price) * 100)}% Off
                                                </span>
                                            )}
                                        </div>

                                        <div className="fk-cart-item-actions">
                                            <button className="fk-cart-action-btn">SAVE FOR LATER</button>
                                            <button className="fk-cart-action-btn" onClick={() => removeFromCart(item._id)}>REMOVE</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="fk-cart-place-order-bar-mobile">
                                <button className="fk-btn-primary fk-place-order-btn" onClick={handleCheckout}>
                                    Place Order
                                </button>
                            </div>
                        </div>

                        {/* RECOMMENDATIONS SECTION IN LEFT COLUMN */}
                        <div className="fk-cart-recommendations">
                            <RecommendedPlants />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Price Details */}
                    <div className="fk-cart-right">
                        <div className="fk-price-card">
                            <div className="fk-price-header">PRICE DETAILS</div>
                            <div className="fk-price-body">
                                <div className="fk-price-row">
                                    <span>Price ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                                    <span>₹{cartSubtotal}</span>
                                </div>
                                <div className="fk-price-row">
                                    <span>Delivery Charges</span>
                                    <span className="fk-free">Free</span>
                                </div>
                                <div className="fk-price-total">
                                    <span>Total Amount</span>
                                    <span>₹{cartSubtotal}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="fk-secure-badge">
                            <FaShieldAlt style={{color: '#878787'}} /> Safe and secure payments. Easy returns. 100% Authentic products.
                        </div>

                        <div className="fk-cart-place-order-bar">
                            <div className="fk-cart-total-display">
                                <span className="fk-total-mrp">₹{cartSubtotal}</span>
                            </div>
                            <button className="fk-btn-primary fk-place-order-btn" onClick={handleCheckout}>
                                Place Order
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Cart;