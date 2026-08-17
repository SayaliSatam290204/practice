import { useState, useEffect } from 'react';
import { FaTrash, FaUserShield, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            try {
                await api.delete(`/admin/users/${id}`);
                toast.success('User deleted successfully');
                setUsers(users.filter(user => user._id !== id));
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading users...</div>;
    if (error) return <div style={{ padding: '20px', color: '#e74c3c' }}>{error}</div>;

    return (
        <div className="manage-users">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Manage Users</h1>
                <div style={{ backgroundColor: '#fff', padding: '10px 20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <strong>Total Users:</strong> {users.length}
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Name</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Phone</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>City</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Role</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Joined</th>
                                <th style={{ padding: '15px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#64748b' }}>{user.email}</td>
                                        <td style={{ padding: '15px', color: '#64748b' }}>{user.phone}</td>
                                        <td style={{ padding: '15px', color: '#64748b' }}>{user.city}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: user.role === 'admin' ? '#e0e7ff' : '#f1f5f9',
                                                color: user.role === 'admin' ? '#4f46e5' : '#64748b'
                                            }}>
                                                {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(user._id, user.name)}
                                                disabled={user.role === 'admin'}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: user.role === 'admin' ? '#cbd5e1' : '#ef4444',
                                                    cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                                                    padding: '5px',
                                                    fontSize: '16px',
                                                    transition: 'color 0.2s'
                                                }}
                                                title={user.role === 'admin' ? "Cannot delete admin" : "Delete user"}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                        No users found
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

export default ManageUsers;
