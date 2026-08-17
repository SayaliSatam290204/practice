import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";

import {
    FaArrowLeft,
    FaCheck,
    FaShieldAlt,
    FaShoppingBag,
    FaRegCheckCircle,
    FaPlus,
    FaMinus
} from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import RecommendedPlants from "../components/plants/RecommendedPlants";
import PlantImagePlaceholder from "../components/plants/PlantImagePlaceholder";
import toast from "react-hot-toast";

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const {
        cartItems,
        cartCount,
        cartSubtotal,
        getItemPrice,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useCart();

    // Steps: 1 = Address, 2 = Order Summary, 3 = Payment
    const [activeStep, setActiveStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    
    const discountAmount = appliedCoupon ? Math.round(cartSubtotal * (appliedCoupon.discountPercentage / 100)) : 0;
    const finalTotal = cartSubtotal - discountAmount;

    const [paymentMethod, setPaymentMethod] = useState("online");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) return "Please enter your full name.";
        if (!formData.phone.trim()) return "Please enter your phone number.";
        if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) return "Please enter a valid 10-digit phone number.";
        if (!formData.address.trim()) return "Please enter your delivery address.";
        if (!formData.city.trim()) return "Please enter your city.";
        if (!formData.state.trim()) return "Please enter your state.";
        if (!/^\d{6}$/.test(formData.pincode.trim())) return "Please enter a valid 6-digit pincode.";
        return null;
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError("");
        setActiveStep(2); 
    };

    const handleSummarySubmit = (e) => {
        e.preventDefault();
        setActiveStep(3); 
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setCouponError("");
            const res = await api.post('/coupons/validate', { code: couponCode.trim() });
            setAppliedCoupon({
                code: res.data.code,
                discountPercentage: res.data.discountPercentage
            });
            toast.success(`${res.data.code} applied successfully!`);
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon');
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        toast.success('Coupon removed');
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const orderPayload = {
                shippingAddress: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim(),
                phone: formData.phone.trim(),
                paymentMethod: paymentMethod === 'online' ? 'Card' : 'COD',
                frontendCartItems: cartItems,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined
            };

            const orderRes = await api.post('/orders/create', orderPayload);
            const dbOrder = orderRes.data.order;

            if (paymentMethod === 'cod') {
                clearCart();
                navigate("/order-success", { replace: true, state: { orderData: orderPayload } });
            } else {
                const res = await loadRazorpay();
                if (!res) {
                    setError("Razorpay SDK failed to load. Are you online?");
                    setLoading(false);
                    return;
                }

                let rzpayRes;
                try {
                    rzpayRes = await api.post('/payments/razorpay/create-order', {
                        amount: finalTotal
                    });
                } catch (err) {
                    toast.error("Oops! The payment gateway is temporarily unavailable. Please try Cash on Delivery or check back later.");
                    setLoading(false);
                    return;
                }
                

                const razorpayOrder = rzpayRes.data;

                const options = {
                    key: "rzp_test_TMXsdAtudE862c",
                    amount: razorpayOrder.amount,
                    currency: "INR",
                    name: "Vrukshavalli Nursery",
                    description: "Plant Purchase",
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await api.post('/payments/razorpay/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: dbOrder._id
                            });

                            if (verifyRes.data.success) {
                                clearCart();
                                toast.success("Payment successful!");
                                navigate("/order-success", { replace: true, state: { orderData: orderPayload, paymentDetails: response } });
                            }
                        } catch (err) {
                            toast.error("Payment verification failed! If money was deducted, it will be automatically refunded.");
                            setError("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: formData.fullName,
                        contact: formData.phone,
                        email: user?.email || ""
                    },
                    theme: {
                        color: "#2874f0" // Flipkart Blue
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                
                paymentObject.on('payment.failed', function (response){
                    toast.error("Payment Failed: " + response.error.description);
                    setError("Payment Failed: " + response.error.description);
                    setLoading(false);
                });
            }
        } catch (error) {
            console.error(error);
            const backendError = error.response?.data?.message || "";
            const displayError = backendError.toLowerCase().includes("not found")
                ? "Payment gateway unavailable. Please choose Cash on Delivery or try again later."
                : (backendError || "Failed to place order.");
            toast.error(displayError);
            setError(displayError);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <section className="empty-checkout">
                    <div className="empty-checkout-icon"><FaShoppingBag /></div>
                    <h1>Your Cart is Empty</h1>
                    <p>Add some plants before proceeding to checkout.</p>
                    <Link to="/plants" className="fk-btn-primary">
                        Continue Shopping
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <div className="fk-checkout-container">
            <header className="fk-header">
                <div className="fk-header-inner">
                    <Link to="/" className="fk-logo">Vrukshavalli</Link>
                </div>
            </header>

            <main className="fk-checkout-main">
                <div className="fk-checkout-layout">
                    
                    {/* LEFT COLUMN: Main Flow */}
                    <div className="fk-flow-container">
                        
                        {/* PROGRESS TRACKER */}
                        <div className="fk-progress-tracker">
                            <div className={`fk-step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                                <div className="fk-step-icon">
                                    {activeStep > 1 ? <FaCheck /> : "1"}
                                </div>
                                <span>Address</span>
                            </div>
                            <div className={`fk-step-line ${activeStep >= 2 ? 'active' : ''}`}></div>
                            
                            <div className={`fk-step ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                                <div className="fk-step-icon">
                                    {activeStep > 2 ? <FaCheck /> : "2"}
                                </div>
                                <span>Order Summary</span>
                            </div>
                            <div className={`fk-step-line ${activeStep >= 3 ? 'active' : ''}`}></div>
                            
                            <div className={`fk-step ${activeStep >= 3 ? 'active' : ''}`}>
                                <div className="fk-step-icon">
                                    {activeStep > 3 ? <FaCheck /> : "3"}
                                </div>
                                <span>Payment</span>
                            </div>
                        </div>

                        {/* STEP 1: ADDRESS */}
                        {activeStep > 1 ? (
                            <div className="fk-completed-card">
                                <div className="fk-completed-header">
                                    <span className="fk-completed-label">Deliver to:</span>
                                    <button className="fk-change-btn" onClick={() => setActiveStep(1)}>Change</button>
                                </div>
                                <div className="fk-completed-body">
                                    <strong>{formData.fullName}</strong>
                                    <p>{formData.address}, {formData.city}, {formData.state}, {formData.pincode}</p>
                                    <p>{formData.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="fk-active-card">
                                {error && <div className="fk-error">{error}</div>}
                                <form onSubmit={handleAddressSubmit} className="fk-form">
                                    <div className="fk-form-row">
                                        <div className="fk-input-group">
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Full Name" />
                                        </div>
                                        <div className="fk-input-group">
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} required placeholder="10-digit mobile number" />
                                        </div>
                                    </div>
                                    <div className="fk-input-group">
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} required placeholder="Address (Area and Street)" />
                                    </div>
                                    <div className="fk-form-row">
                                        <div className="fk-input-group">
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City/District/Town" />
                                        </div>
                                        <div className="fk-input-group">
                                            <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State" />
                                        </div>
                                    </div>
                                    <div className="fk-input-group" style={{width: 'calc(50% - 8px)'}}>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} required placeholder="Pincode" />
                                    </div>
                                    <button type="submit" className="fk-btn-primary">Save and Deliver Here</button>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: ORDER SUMMARY */}
                        {activeStep === 2 && (
                            <div className="fk-active-card">
                                <div className="fk-order-items">
                                    {cartItems.map((item) => {
                                        const isPlaceholder = !item.image || item.image.includes('placehold.co') || item.image.includes('via.placeholder.com');
                                        return (
                                        <div key={item._id} className="fk-item">
                                            <div className="fk-item-image">
                                                {isPlaceholder ? (
                                                    <PlantImagePlaceholder />
                                                ) : (
                                                    <img src={item.image} alt={item.name} />
                                                )}
                                            </div>
                                            <div className="fk-item-details">
                                                <div className="fk-item-title">{item.name}</div>
                                                <div className="fk-item-price">
                                                    <span className="fk-price-current">₹{getItemPrice(item)}</span>
                                                </div>
                                                <div className="fk-item-qty-controls">
                                                    <div className="fk-qty-box">
                                                        <button type="button" onClick={() => decreaseQuantity(item._id)} disabled={item.quantity <= 1} className="fk-qty-btn"><FaMinus /></button>
                                                        <input type="text" value={item.quantity} readOnly className="fk-qty-input" />
                                                        <button type="button" onClick={() => increaseQuantity(item._id)} disabled={item.quantity >= (item.stock || 10)} className="fk-qty-btn"><FaPlus /></button>
                                                    </div>
                                                    <button type="button" onClick={() => removeFromCart(item._id)} className="fk-remove-btn">REMOVE</button>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                                
                                {/* COUPON SECTION */}
                                <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px' }}>Apply Coupon</h4>
                                    {!appliedCoupon ? (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input 
                                                type="text" 
                                                value={couponCode} 
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter coupon code" 
                                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', textTransform: 'uppercase' }}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleApplyCoupon}
                                                style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                            >
                                                APPLY
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d1fae5', padding: '10px 15px', borderRadius: '4px' }}>
                                            <div>
                                                <span style={{ fontWeight: 'bold', color: '#059669', marginRight: '10px' }}>{appliedCoupon.code}</span>
                                                <span style={{ fontSize: '13px', color: '#047857' }}>{appliedCoupon.discountPercentage}% Off Applied</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveCoupon}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    )}
                                    {couponError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{couponError}</div>}
                                </div>

                                <div className="fk-continue-bar">
                                    <p>Order confirmation email will be sent to <strong>{user?.email || 'your email'}</strong></p>
                                    <button type="button" className="fk-btn-primary" onClick={handleSummarySubmit}>Continue</button>
                                </div>
                            </div>
                        )}

                        {activeStep > 2 && (
                            <div className="fk-completed-card">
                                <div className="fk-completed-header">
                                    <span className="fk-completed-label">Order Summary</span>
                                    <button className="fk-change-btn" onClick={() => setActiveStep(2)}>Change</button>
                                </div>
                                <div className="fk-completed-body">
                                    <strong>{cartCount} Item(s)</strong>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT */}
                        {activeStep === 3 && (
                            <div className="fk-active-card no-padding">
                                <div className="fk-payment-header">
                                    <button className="fk-back-btn" onClick={() => setActiveStep(2)}><FaArrowLeft /> Complete Payment</button>
                                </div>
                                {error && <div className="fk-error" style={{margin: '16px'}}>{error}</div>}
                                
                                <div className="fk-payment-layout">
                                    <div className="fk-payment-tabs">
                                        <div 
                                            className={`fk-payment-tab ${paymentMethod === 'online' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('online')}
                                        >
                                            UPI / Credit / Debit Card
                                        </div>
                                        <div 
                                            className={`fk-payment-tab ${paymentMethod === 'cod' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('cod')}
                                        >
                                            Cash on Delivery
                                        </div>
                                    </div>
                                    <div className="fk-payment-content">
                                        {paymentMethod === 'online' && (
                                            <div className="fk-payment-pane">
                                                <h4>Pay securely online via Razorpay</h4>
                                                <p className="fk-payment-desc">You can use any UPI app, Credit Card, Debit Card, or Net Banking.</p>
                                                <button type="button" className="fk-btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                                                    {loading ? "Processing..." : `Pay ₹${finalTotal}`}
                                                </button>
                                            </div>
                                        )}

                                        {paymentMethod === 'cod' && (
                                            <div className="fk-payment-pane">
                                                <h4>Cash on Delivery</h4>
                                                <p className="fk-payment-desc">Pay at your doorstep when the items are delivered.</p>
                                                <button type="button" className="fk-btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                                                    {loading ? "Processing..." : `Place Order`}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: PRICE DETAILS */}
                    <div className="fk-summary-container">
                        <div className="fk-price-card">
                            <div className="fk-price-header">PRICE DETAILS</div>
                            <div className="fk-price-body">
                                <div className="fk-price-row">
                                    <span>Price ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                                    <span>₹{cartSubtotal}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="fk-price-row" style={{ color: '#388e3c' }}>
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span>- ₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="fk-price-row">
                                    <span>Delivery Charges</span>
                                    <span className="fk-free">Free</span>
                                </div>
                                <div className="fk-price-total">
                                    <span>Total Amount</span>
                                    <span>₹{finalTotal}</span>
                                </div>
                                {appliedCoupon && (
                                    <div style={{ color: '#388e3c', fontSize: '14px', fontWeight: '500', marginTop: '12px' }}>
                                        You will save ₹{discountAmount} on this order
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="fk-secure-badge">
                            <FaShieldAlt /> 100% Secure Payments
                        </div>
                    </div>

                </div>
            </main>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>
                <RecommendedPlants />
            </div>
            
        </div>
    );
};

export default Checkout;