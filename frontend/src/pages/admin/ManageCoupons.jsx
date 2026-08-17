import { useState, useEffect } from 'react';
import { FaTrash, FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        expiryDate: ''
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await api.get('/coupons');
            setCoupons(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch coupons');
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/coupons', {
                ...formData,
                discountPercentage: Number(formData.discountPercentage)
            });
            toast.success('Coupon created successfully');
            setCoupons([res.data, ...coupons]);
            setFormData({ code: '', discountPercentage: '', expiryDate: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleDelete = async (id, code) => {
        if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
            try {
                await api.delete(`/coupons/${id}`);
                toast.success('Coupon deleted');
                setCoupons(coupons.filter(c => c._id !== id));
            } catch (err) {
                toast.error('Failed to delete coupon');
            }
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading coupons...</div>;
    if (error) return <div style={{ padding: '20px', color: '#e74c3c' }}>{error}</div>;

    return (
        <div className="manage-coupons">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Manage Coupons</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                {/* Create Form */}
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                        Create New Coupon
                    </h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Coupon Code</label>
                            <input 
                                type="text" 
                                name="code" 
                                value={formData.code} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g. SUMMER20"
                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', textTransform: 'uppercase' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Discount Percentage (%)</label>
                            <input 
                                type="number" 
                                name="discountPercentage" 
                                value={formData.discountPercentage} 
                                onChange={handleChange} 
                                required 
                                min="1" 
                                max="100"
                                placeholder="20"
                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Expiry Date</label>
                            <input 
                                type="date" 
                                name="expiryDate" 
                                value={formData.expiryDate} 
                                onChange={handleChange} 
                                required 
                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <button type="submit" style={{ backgroundColor: '#1abc9c', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                            Add Coupon
                        </button>
                    </form>
                </div>

                {/* Coupons List */}
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Code</th>
                                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Discount</th>
                                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Expiry Date</th>
                                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '15px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.length > 0 ? (
                                    coupons.map(coupon => {
                                        const isExpired = new Date(coupon.expiryDate) < new Date();
                                        return (
                                            <tr key={coupon._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', letterSpacing: '1px' }}>
                                                    <FaTag style={{ color: '#1abc9c', marginRight: '8px' }} />
                                                    {coupon.code}
                                                </td>
                                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#e74c3c' }}>{coupon.discountPercentage}%</td>
                                                <td style={{ padding: '15px', color: '#64748b' }}>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px' }}>
                                                    {isExpired ? (
                                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Expired</span>
                                                    ) : (
                                                        <span style={{ backgroundColor: '#d1fae5', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id, coupon.code)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                                        title="Delete coupon"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                            No coupons found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCoupons;
