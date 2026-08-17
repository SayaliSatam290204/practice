import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            // sort by newest first (assuming timestamps exist)
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const validTransitions = {
        "Pending": ["Confirmed"],
        "Confirmed": ["Packed"],
        "Packed": ["Shipped"],
        "Shipped": ["Delivered"],
        "Delivered": [],
        "Cancelled": [],
        "Returned": []
    };

    const handleStatusUpdate = async (id, newStatus) => {
        let trackingNumber = null;
        if (newStatus === 'Shipped') {
            trackingNumber = window.prompt("Enter tracking number (required):");
            if (!trackingNumber) {
                toast.error("Tracking number is required to ship an order");
                return;
            }
        }

        try {
            await api.put(`/admin/orders/${id}/status`, { orderStatus: newStatus, trackingNumber });
            
            // update local state
            setOrders(orders.map(order => 
                order._id === id ? { ...order, orderStatus: newStatus } : order
            ));
            
            toast.success('Order status updated successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update status');
            fetchOrders(); // Revert back to database state on failure
        }
    };

    if (loading) return <div>Loading orders...</div>;

    const statusColors = {
        'Pending': '#f39c12',
        'Confirmed': '#3498db',
        'Packed': '#9b59b6',
        'Shipped': '#f1c40f',
        'Delivered': '#2ecc71',
        'Cancelled': '#e74c3c'
    };

    return (
        <div className="manage-orders">
            <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Manage Orders</h1>

            {error && <div className="error-message">{error}</div>}

            <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Order ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Customer</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Date</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Amount</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Items</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                                    {order._id.substring(order._id.length - 8).toUpperCase()}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{order.user?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{order.user?.email}</div>
                                </td>
                                <td style={{ padding: '15px', color: '#2c3e50' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    ₹{order.totalAmount}
                                </td>
                                <td style={{ padding: '15px', fontSize: '14px' }}>
                                    {order.items.length} item(s)
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' ? (
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '5px',
                                            border: `1px solid ${statusColors[order.orderStatus] || '#ddd'}`,
                                            backgroundColor: `${statusColors[order.orderStatus]}15` || 'white',
                                            color: statusColors[order.orderStatus] || '#333',
                                            fontWeight: 'bold',
                                            display: 'inline-block'
                                        }}>
                                            {order.orderStatus}
                                        </div>
                                    ) : (
                                        <select 
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '5px',
                                                border: `1px solid ${statusColors[order.orderStatus] || '#ddd'}`,
                                                backgroundColor: `${statusColors[order.orderStatus]}15` || 'white',
                                                color: statusColors[order.orderStatus] || '#333',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value={order.orderStatus}>{order.orderStatus}</option>
                                            {validTransitions[order.orderStatus]?.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrders;
