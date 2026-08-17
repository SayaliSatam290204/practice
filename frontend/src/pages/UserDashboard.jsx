import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaBoxOpen, FaHeart, FaStar, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const UserDashboard = () => {
    const { user } = useAuth();
    const { wishlistItems } = useWishlist();
    const { addToCart } = useCart();
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [seasonalPlants, setSeasonalPlants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch recent orders
                const ordersRes = await api.get("/orders/my-orders");
                const orderData = ordersRes.data?.orders || ordersRes.data?.data || ordersRes.data || [];
                const ordersList = Array.isArray(orderData) ? orderData : [];
                setRecentOrders(ordersList.slice(0, 3)); // Only take top 3

                // Fetch "seasonal" plants (e.g. top 4 recent/active plants)
                const plantsRes = await api.get("/plants");
                const plantsList = plantsRes.data?.plants || plantsRes.data?.data || plantsRes.data || [];
                // Just for simulation, sort randomly or take first 4 as seasonal
                setSeasonalPlants(plantsList.slice(0, 4));

            } catch (err) {
                console.error("Dashboard fetch error:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });
    };

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard-container">
                
                {/* Header */}
                <section className="dashboard-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            <FaLeaf /> Welcome Back!
                        </span>
                        <h1>Hello, {user?.name || "Plant Lover"}</h1>
                        <p>Here is an overview of your nursery activities and seasonal recommendations.</p>
                    </div>
                </section>

                {/* Seasonal Plants */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2><FaLeaf /> Seasonal Highlights</h2>
                        <Link to="/plants" className="view-all-link">View All Shop <FaArrowRight /></Link>
                    </div>
                    
                    <div className="seasonal-grid">
                        {seasonalPlants.map(plant => (
                            <article key={plant._id} className="plant-card seasonal-card">
                                <div className="plant-image-container">
                                    <Link to={`/plants/${plant._id}`}>
                                        <img src={plant.image} alt={plant.name} className="plant-image" />
                                    </Link>
                                    {(plant.discountPrice && plant.discountPrice < plant.price) && (
                                        <span className="discount-badge">Sale</span>
                                    )}
                                </div>
                                <div className="plant-content">
                                    <span className="plant-category">{plant.category}</span>
                                    <Link to={`/plants/${plant._id}`} className="plant-title-link">
                                        <h3 className="plant-title">{plant.name}</h3>
                                    </Link>
                                    <div className="plant-price-container">
                                        <span className="plant-price">
                                            {formatPrice(plant.discountPrice && plant.discountPrice < plant.price ? plant.discountPrice : plant.price)}
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn-primary w-full"
                                        onClick={() => addToCart(plant, 1)}
                                        disabled={!plant.stock || plant.stock <= 0}
                                        style={{ marginTop: '10px' }}
                                    >
                                        <FaShoppingCart style={{ marginRight: '8px' }} />
                                        Add to Cart
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Dual Grid: Orders & Wishlist */}
                <div className="dashboard-dual-grid">
                    
                    {/* Recent Orders */}
                    <section className="dashboard-section half-width">
                        <div className="section-header">
                            <h2><FaBoxOpen /> Recent Orders</h2>
                            <Link to="/orders" className="view-all-link">View All <FaArrowRight /></Link>
                        </div>
                        
                        <div className="recent-list">
                            {recentOrders.length === 0 ? (
                                <div className="empty-state-small">
                                    <p>No recent orders found.</p>
                                    <Link to="/plants" className="btn-secondary btn-sm">Start Shopping</Link>
                                </div>
                            ) : (
                                recentOrders.map(order => (
                                    <div key={order._id || order.id} className="summary-item-card">
                                        <div className="summary-info">
                                            <strong>Order #{String(order._id || order.id).slice(-8).toUpperCase()}</strong>
                                            <span className="summary-date">
                                                {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="summary-status">
                                            <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'success' : 'processing'}`}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Recent Wishlist */}
                    <section className="dashboard-section half-width">
                        <div className="section-header">
                            <h2><FaHeart /> My Wishlist</h2>
                            <Link to="/wishlist" className="view-all-link">View All <FaArrowRight /></Link>
                        </div>
                        
                        <div className="recent-list">
                            {wishlistItems.length === 0 ? (
                                <div className="empty-state-small">
                                    <p>Your wishlist is currently empty.</p>
                                </div>
                            ) : (
                                wishlistItems.slice(0, 3).map(plant => (
                                    <div key={plant._id} className="summary-item-card wishlist-summary">
                                        <img src={plant.image} alt={plant.name} className="summary-thumb" />
                                        <div className="summary-info">
                                            <strong>{plant.name}</strong>
                                            <span className="summary-price">{formatPrice(plant.price)}</span>
                                        </div>
                                        <Link to={`/plants/${plant._id}`} className="btn-secondary btn-sm">
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
                
            </div>
        </main>
    );
};

export default UserDashboard;
