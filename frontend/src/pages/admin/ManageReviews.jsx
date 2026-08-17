import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaStar, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reviews');
            setReviews(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch reviews');
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const toggleApproval = async (id, currentStatus) => {
        try {
            await api.put(`/admin/reviews/${id}/approval`, { approved: !currentStatus });
            toast.success(currentStatus ? 'Review hidden successfully' : 'Review approved successfully');
            setReviews(reviews.map(review => 
                review._id === id ? { ...review, approved: !currentStatus } : review
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update review status');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading reviews...</div>;
    if (error) return <div style={{ padding: '20px', color: '#e74c3c' }}>{error}</div>;

    return (
        <div className="manage-reviews">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Manage Reviews</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '10px 20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <strong>Total:</strong> {reviews.length}
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '10px 20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#f59e0b' }}>
                        <strong>Pending:</strong> {reviews.filter(r => !r.approved).length}
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Reviewer</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Plant</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Rating</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600', width: '30%' }}>Comment</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <tr key={review._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', backgroundColor: review.approved ? 'transparent' : '#fffbeb' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '500', color: '#1e293b' }}>{review.user?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{review.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {review.plant?.image && <img src={review.plant.image} alt={review.plant.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                                <span style={{ fontWeight: '500', color: '#334155' }}>{review.plant?.name || 'Deleted Plant'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', color: '#f59e0b' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} color={i < review.rating ? "#f59e0b" : "#e5e7eb"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#475569', fontSize: '14px' }}>
                                            <div style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                                {review.comment}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {review.approved ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                                    <FaCheckCircle /> Approved
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                                    <FaEyeSlash /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => toggleApproval(review._id, review.approved)}
                                                style={{
                                                    background: review.approved ? '#f1f5f9' : '#10b981',
                                                    color: review.approved ? '#64748b' : '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {review.approved ? <><FaEyeSlash /> Hide</> : <><FaCheckCircle /> Approve</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                        No reviews found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageReviews;
