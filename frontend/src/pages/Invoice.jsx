import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaPrint, FaArrowLeft, FaLeaf } from 'react-icons/fa';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Determine if fetching from user or admin endpoint based on path or try both
                let response;
                try {
                    response = await api.get(`/orders/my-orders`);
                    const orderData = response.data?.orders || response.data?.data || response.data;
                    const found = orderData.find(o => o._id === id || o.id === id);
                    if (found) {
                        setOrder(found);
                        setLoading(false);
                        return;
                    }
                } catch(e) {
                    console.error("Not found in user orders, trying admin...");
                }

                // If user doesn't have it or we are admin, try fetching all admin orders
                response = await api.get(`/admin/orders`);
                const allOrders = response.data;
                const foundAdmin = allOrders.find(o => o._id === id || o.id === id);
                if (foundAdmin) {
                    setOrder(foundAdmin);
                } else {
                    setError("Order not found.");
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Unable to load invoice.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading invoice...</div>;
    if (error || !order) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error || 'Invoice not found'}</div>;

    const orderId = order._id || order.id;
    const orderDate = new Date(order.createdAt || order.orderDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    };

    const orderItems = order.items || order.orderItems || [];
    const subtotal = orderItems.reduce((acc, item) => acc + (item.price || item.plant?.price || 0) * (item.quantity || 1), 0);
    const grandTotal = order.totalAmount ?? order.total ?? order.grandTotal ?? 0;
    const discount = subtotal - grandTotal > 0 ? subtotal - grandTotal : 0;

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif' }}>
            
            {/* Non-printable action bar */}
            <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaArrowLeft /> Back
                </button>
                <button 
                    onClick={handlePrint} 
                    style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                >
                    <FaPrint /> Print / Save PDF
                </button>
            </div>

            {/* Printable Invoice Page */}
            <div className="print-area" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                            <FaLeaf /> Vrukshavalli Nursery
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>123 Green Avenue, Botany District</div>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>support@vrukshavalli.com | +91 98765 43210</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</h1>
                        <div style={{ color: '#4b5563', marginBottom: '4px' }}><strong>Order ID:</strong> #{orderId.slice(-8).toUpperCase()}</div>
                        <div style={{ color: '#4b5563', marginBottom: '4px' }}><strong>Date:</strong> {orderDate}</div>
                        <div style={{ color: '#4b5563' }}><strong>Status:</strong> {order.orderStatus || order.status || 'Completed'}</div>
                    </div>
                </div>

                {/* Customer Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ width: '48%' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px', color: '#374151' }}>Billed To:</h3>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1f2937' }}>{order.user?.name || order.shippingAddress?.fullName || 'Customer'}</div>
                        <div style={{ color: '#4b5563', fontSize: '14px' }}>{order.user?.email || ''}</div>
                        <div style={{ color: '#4b5563', fontSize: '14px' }}>{order.shippingAddress?.phone || ''}</div>
                    </div>
                    <div style={{ width: '48%' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px', color: '#374151' }}>Shipped To:</h3>
                        <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                            {order.shippingAddress ? (
                                <>
                                    <div>{order.shippingAddress.addressLine1}</div>
                                    {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</div>
                                </>
                            ) : 'Address not available'}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', borderTop: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#374151', width: '50%' }}>Item Description</th>
                            <th style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>Price</th>
                            <th style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>Qty</th>
                            <th style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item, index) => {
                            const itemName = item.plant?.name || item.product?.name || item.name || "Plant";
                            const itemPrice = item.price || item.plant?.price || 0;
                            const itemQty = item.quantity || 1;
                            const itemTotal = itemPrice * itemQty;
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '16px 12px', color: '#1f2937' }}>{itemName}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#4b5563' }}>{formatPrice(itemPrice)}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#4b5563' }}>{itemQty}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'right', color: '#1f2937', fontWeight: '500' }}>{formatPrice(itemTotal)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#4b5563' }}>
                            <span>Subtotal:</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#16a34a' }}>
                                <span>Discount:</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#4b5563' }}>
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px', marginTop: '8px', backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 'bold', color: '#1f2937', fontSize: '18px' }}>
                            <span>Grand Total:</span>
                            <span>{formatPrice(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>Thank you for shopping with Vrukshavalli Nursery!</p>
                    <p style={{ margin: 0 }}>This is a computer-generated invoice and does not require a physical signature.</p>
                </div>

            </div>

            {/* Print specific CSS */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Invoice;
