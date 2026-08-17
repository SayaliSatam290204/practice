import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

import {
    FaBoxOpen,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaLeaf,
    FaTruck,
    FaTimesCircle,
    FaArrowLeft,
    FaStar,
    FaUndo,
    FaFileInvoice,
} from "react-icons/fa";

import api from "../services/api";
import PlantImagePlaceholder from "../components/plants/PlantImagePlaceholder";

const Orders = () => {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewPlant, setReviewPlant] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewStatus, setReviewStatus] = useState({ loading: false, error: "", success: "" });

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.put(`/orders/${orderId}/cancel`);
            toast.success("Order cancelled successfully");
            setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel order");
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to return this order?")) return;
        try {
            await api.put(`/orders/${orderId}/return`);
            toast.success("Order return requested successfully");
            setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: 'Returned' } : o));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to return order");
        }
    };

    const openReviewModal = (plantId, plantName) => {
        setReviewPlant({ id: plantId, name: plantName });
        setRating(5);
        setComment("");
        setReviewStatus({ loading: false, error: "", success: "" });
        setReviewModalOpen(true);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!reviewPlant) return;
        
        try {
            setReviewStatus({ loading: true, error: "", success: "" });
            await api.post("/reviews/create", {
                plant: reviewPlant.id,
                rating,
                comment
            });
            setReviewStatus({ loading: false, error: "", success: "Review submitted successfully!" });
            setTimeout(() => setReviewModalOpen(false), 2000);
        } catch (err) {
            setReviewStatus({ 
                loading: false, 
                error: err.response?.data?.message || "Failed to submit review.", 
                success: "" 
            });
        }
    };


    // =========================
    // FETCH ORDERS
    // =========================

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await api.get("/orders/my-orders");


                const orderData =
                    response.data?.orders ||
                    response.data?.data ||
                    response.data;


                setOrders(
                    Array.isArray(orderData)
                        ? orderData
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to fetch orders:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load your orders."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchOrders();

    }, []);


    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice = (price) => {

        return Number(price || 0).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        );

    };


    // =========================
    // ORDER STATUS
    // =========================

    const getStatusIcon = (status) => {

        const normalizedStatus =
            status?.toLowerCase();


        switch (normalizedStatus) {

            case "delivered":
                return <FaCheckCircle />;

            case "shipped":
                return <FaTruck />;

            case "cancelled":
                return <FaTimesCircle />;

            case "pending":
                return <FaClock />;

            default:
                return <FaBoxOpen />;

        }

    };


    const getStatusClass = (status) => {

        const normalizedStatus =
            status?.toLowerCase();


        switch (normalizedStatus) {

            case "delivered":
                return "status-delivered";

            case "shipped":
                return "status-shipped";

            case "cancelled":
                return "status-cancelled";

            case "pending":
                return "status-pending";

            default:
                return "status-processing";

        }

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <main className="orders-page">

                <div className="orders-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your orders...
                    </p>

                </div>

            </main>

        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (

            <main className="orders-page">

                <div className="orders-container">

                    <div className="orders-error">

                        <FaBoxOpen />

                        <h1>
                            Unable to Load Orders
                        </h1>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="orders-retry-button"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </main>

        );

    }


    // =========================
    // EMPTY ORDERS
    // =========================

    if (orders.length === 0) {

        return (

            <main className="orders-page">

                <div className="orders-container">

                    <div className="orders-header">

                        <div>

                            <span className="orders-eyebrow">

                                <FaLeaf />

                                My Account

                            </span>

                            <h1>
                                My Orders
                            </h1>

                            <p>
                                Track and manage your
                                Plant Nursery orders.
                            </p>

                        </div>

                    </div>


                    <div className="empty-state-container">
                        <div className="empty-state-icon">
                            <FaBoxOpen />
                        </div>
                        <h2>No Orders Yet</h2>
                        <p>
                            You haven't placed any orders
                            yet. Start exploring our plants
                            and find something you love.
                        </p>
                        <Link to="/plants" className="primary-button">
                            <FaLeaf style={{ marginRight: '8px' }} /> Explore Plants
                        </Link>
                    </div>

                </div>

            </main>

        );

    }


    // =========================
    // ORDERS PAGE
    // =========================

    return (
        <>
        <main className="orders-page">

            <div className="orders-container">


                {/* =========================
                    HEADER
                ========================== */}

                <section className="orders-header">

                    <div>

                        <span className="orders-eyebrow">

                            <FaLeaf />

                            My Account

                        </span>

                        <h1>
                            My Orders
                        </h1>

                        <p>
                            Track and manage your
                            Plant Nursery orders.
                        </p>

                    </div>

                    <Link
                        to="/plants"
                        className="orders-continue-shopping"
                    >

                        <FaArrowLeft />

                        Continue Shopping

                    </Link>

                </section>


                {/* =========================
                    ORDER LIST
                ========================== */}

                <section className="orders-list">

                    {orders.map((order) => {

                        const orderItems =
                            order.items ||
                            order.orderItems ||
                            [];


                        const orderTotal =
                            order.totalAmount ??
                            order.total ??
                            order.grandTotal ??
                            0;


                        const orderStatus =
                            order.orderStatus ||
                            order.status ||
                            "Processing";


                        const orderId =
                            order._id ||
                            order.id;


                        return (

                            <article
                                key={orderId}
                                className="order-card"
                            >


                                {/* =========================
                                    ORDER HEADER
                                ========================== */}

                                <div className="order-card-header">
                                    <div className="order-header-left">
                                        <div className="order-id-group">
                                            <span className="order-label">Order ID</span>
                                            <strong>#{orderId?.slice(-8).toUpperCase()}</strong>
                                        </div>
                                        <div className="order-date-group">
                                            <span className="order-label">Date Placed</span>
                                            <span>{formatDate(order.createdAt || order.orderDate)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="order-header-right">
                                        <div className={`order-status-badge ${getStatusClass(orderStatus)}`}>
                                            {getStatusIcon(orderStatus)}
                                            <span>{orderStatus}</span>
                                        </div>
                                    </div>
                                </div>


                                {/* =========================
                                    ORDER STATUS STEPPER
                                ========================== */}
                                
                                {orderStatus.toLowerCase() === 'cancelled' ? (
                                    <div className="order-cancelled-alert">
                                        <FaTimesCircle size={20} /> 
                                        <span>Order was cancelled.</span>
                                    </div>
                                ) : orderStatus.toLowerCase() === 'returned' ? (
                                    <div className="order-cancelled-alert" style={{ background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}>
                                        <FaUndo size={20} /> 
                                        <span>Order return requested.</span>
                                    </div>
                                ) : (
                                    <div className="order-stepper">
                                        {["Pending", "Confirmed", "Packed", "Shipped", "Delivered"].map((step, index, arr) => {
                                            const stepIndex = arr.indexOf(step);
                                            const currentStatusIndex = arr.indexOf(orderStatus);
                                            
                                            // Handle missing history gracefully by relying on current status index
                                            const isCompleted = stepIndex <= currentStatusIndex && currentStatusIndex !== -1;
                                            
                                            // Look for history entry
                                            const history = order.statusHistory || [];
                                            const historyEntry = history.find(h => h.status === step);
                                            
                                            return (
                                                <div key={step} className={`stepper-item ${isCompleted ? 'completed' : ''}`}>
                                                    <div className="stepper-marker">
                                                        {isCompleted ? <FaCheckCircle /> : <div className="stepper-dot"></div>}
                                                    </div>
                                                    <div className="stepper-content">
                                                        <div className="stepper-title">{step}</div>
                                                        {isCompleted && historyEntry?.timestamp && (
                                                            <div className="stepper-date">
                                                                {new Date(historyEntry.timestamp).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                                            </div>
                                                        )}
                                                        {step === 'Shipped' && order.trackingNumber && isCompleted && (
                                                            <div className="stepper-tracking">
                                                                Tracking: {order.trackingNumber}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {index < arr.length - 1 && <div className="stepper-line"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}


                                {/* =========================
                                    ORDER ITEMS
                                ========================== */}

                                <div className="order-items-list">
                                    {orderItems.map((item, index) => {
                                        const product = item.plant || item.product || item;
                                        // Prioritize natively stored name over populated plant name
                                        const itemName = item.name || product?.name || "Plant";
                                        const itemImage = item.image || product?.image || "";
                                        const itemCategory = item.category || product?.category || "";
                                        const itemQuantity = item.quantity || 1;
                                        const itemPrice = item.price || product?.price || 0;
                                        
                                        const isPlaceholderImage = !itemImage || itemImage.includes('placehold.co') || itemImage.includes('via.placeholder.com');

                                        return (
                                            <div className="order-item-row" key={item._id || item.productId || index}>
                                                <div className="item-thumbnail">
                                                    {isPlaceholderImage ? (
                                                        <PlantImagePlaceholder />
                                                    ) : (
                                                        <img src={itemImage} alt={itemName} />
                                                    )}
                                                </div>
                                                <div className="item-details">
                                                    <h3 className="item-title">{itemName}</h3>
                                                    <span className="item-qty">Qty: {itemQuantity}</span>
                                                </div>
                                                <div className="item-price-col">
                                                    <div>{formatPrice(itemPrice * itemQuantity)}</div>
                                                    {orderStatus.toLowerCase() === 'delivered' && (
                                                        <button 
                                                            onClick={() => openReviewModal(product._id || product.id || item.productId, itemName)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#16a34a',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                marginTop: '8px',
                                                                textDecoration: 'underline',
                                                                padding: 0
                                                            }}
                                                        >
                                                            Leave a Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>


                                {/* =========================
                                    ORDER FOOTER (SUMMARY & ACTIONS)
                                ========================== */}

                                <div className="order-card-footer">
                                    <div className="order-summary-box">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(orderTotal)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="summary-row grand-total">
                                            <span>Total Paid</span>
                                            <strong>{formatPrice(orderTotal)}</strong>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        {['Pending', 'Confirmed', 'Packed'].includes(orderStatus) && (
                                            <button className="btn-secondary" onClick={() => handleCancelOrder(orderId)} style={{color: '#ef4444', borderColor: '#ef4444'}}>
                                                <FaTimesCircle style={{ marginRight: '8px' }} /> Cancel Order
                                            </button>
                                        )}
                                        {orderStatus === 'Delivered' && (
                                            <button className="btn-secondary" onClick={() => handleReturnOrder(orderId)}>
                                                <FaUndo style={{ marginRight: '8px' }} /> Return Order
                                            </button>
                                        )}
                                        {orderStatus === 'Shipped' && (
                                            <button className="btn-secondary" onClick={() => toast.info("Tracking feature coming soon!")}>
                                                <FaTruck style={{ marginRight: '8px' }} /> Track Package
                                            </button>
                                        )}
                                        {['Delivered', 'Shipped'].includes(orderStatus) && (
                                            <a 
                                                href={`/orders/${orderId}/invoice`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn-secondary"
                                            >
                                                <FaFileInvoice style={{ marginRight: '8px' }} /> Download Invoice
                                            </a>
                                        )}
                                        <Link to="/plants" className="btn-primary">
                                            <FaBoxOpen style={{ marginRight: '8px' }} /> Buy Again
                                        </Link>
                                    </div>
                                </div>
                            </article>

                        );

                    })}

                </section>

            </div>

        </main>

            {/* =========================
                REVIEW MODAL
            ========================== */}
            {reviewModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ margin: '0 0 15px 0' }}>Rate {reviewPlant?.name}</h2>
                        {reviewStatus.success ? (
                            <div style={{ color: '#16a34a', padding: '20px 0', textAlign: 'center' }}>
                                <FaCheckCircle size={40} style={{ marginBottom: '10px' }} />
                                <p>{reviewStatus.success}</p>
                            </div>
                        ) : (
                            <form onSubmit={submitReview}>
                                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar 
                                            key={star} 
                                            size={28}
                                            color={star <= rating ? '#f59e0b' : '#e2e8f0'}
                                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                            onClick={() => setRating(star)}
                                        />
                                    ))}
                                </div>
                                <textarea 
                                    placeholder="Write your review here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', height: '100px', padding: '12px', border: '1px solid #e2e8f0',
                                        borderRadius: '8px', marginBottom: '15px', fontFamily: 'inherit'
                                    }}
                                />
                                {reviewStatus.error && <p style={{ color: '#ef4444', margin: '0 0 15px 0', fontSize: '14px' }}>{reviewStatus.error}</p>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setReviewModalOpen(false)}
                                        style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={reviewStatus.loading}
                                        style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        {reviewStatus.loading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );

};


export default Orders;