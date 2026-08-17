import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaLeaf, FaShoppingCart, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data.stats);
                setDashboardData({
                    recentOrders: response.data.recentOrders || [],
                    lowStockPlants: response.data.lowStockPlants || [],
                    chartData: response.data.chartData || []
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard statistics...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return null;

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers || 0, icon: <FaUsers />, color: '#3498db' },
        { title: 'Total Plants', value: stats.totalPlants || 0, icon: <FaLeaf />, color: '#2ecc71' },
        { title: 'Total Orders', value: stats.totalOrders || 0, icon: <FaShoppingCart />, color: '#9b59b6' },
        { title: 'Pending Orders', value: stats.pendingOrders || 0, icon: <FaClock />, color: '#f1c40f' },
        { title: 'Delivered Orders', value: stats.deliveredOrdes || 0, icon: <FaCheckCircle />, color: '#1abc9c' },
        { title: 'Cancelled Orders', value: stats.cancelledOrders || 0, icon: <FaTimesCircle />, color: '#e74c3c' }
    ];

    return (
        <div className="admin-dashboard">
            <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Dashboard Overview</h1>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px' 
            }}>
                {statCards.map((card, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            backgroundColor: `${card.color}20`,
                            color: card.color,
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '24px',
                            marginRight: '20px'
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase' }}>
                                {card.title}
                            </h3>
                            <p style={{ margin: '5px 0 0', fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                                {card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {dashboardData && (
                <div className="dashboard-grid">
                    <div className="dashboard-widget" style={{ gridColumn: '1 / -1' }}>
                        <h3>Orders (Last 7 Days)</h3>
                        <div className="css-bar-chart">
                            {dashboardData.chartData.map((data, idx) => {
                                const maxOrders = Math.max(...dashboardData.chartData.map(d => d.orders), 1);
                                const heightPercent = (data.orders / maxOrders) * 100;
                                return (
                                    <div key={idx} className="chart-bar-container">
                                        <div 
                                            className="chart-bar" 
                                            style={{ height: `${heightPercent}%` }}
                                        ></div>
                                        <div className="chart-label">{data.date}</div>
                                        <div className="chart-tooltip">
                                            {data.orders} orders (₹{data.revenue})
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="dashboard-widget">
                        <h3>Recent Orders</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="recent-orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recentOrders.length > 0 ? (
                                        dashboardData.recentOrders.map(order => (
                                            <tr key={order._id}>
                                                <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>#{order._id.substring(order._id.length - 6)}</td>
                                                <td>{order.user?.name || 'Unknown'}</td>
                                                <td>₹{order.totalAmount}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor: order.orderStatus === 'Delivered' ? '#d1fae5' : order.orderStatus === 'Cancelled' ? '#fee2e2' : '#e0e7ff',
                                                        color: order.orderStatus === 'Delivered' ? '#10b981' : order.orderStatus === 'Cancelled' ? '#ef4444' : '#4f46e5'
                                                    }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '15px' }}>No recent orders</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="dashboard-widget">
                        <h3>Low Stock Plants</h3>
                        <div className="low-stock-list">
                            {dashboardData.lowStockPlants.length > 0 ? (
                                dashboardData.lowStockPlants.map(plant => (
                                    <div key={plant._id} className="low-stock-item">
                                        {plant.image ? (
                                            <img src={plant.image} alt={plant.name} className="low-stock-img" />
                                        ) : (
                                            <div className="low-stock-img" style={{ backgroundColor: '#f1f5f9' }}></div>
                                        )}
                                        <div className="low-stock-info">
                                            <div className="low-stock-name">{plant.name}</div>
                                            <div className="low-stock-qty">Only {plant.stock} left in stock</div>
                                        </div>
                                        <Link to="/admin/plants" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                                            Manage
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '14px' }}>All plants are well stocked!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
