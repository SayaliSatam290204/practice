import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ManagePlants = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        try {
            const response = await api.get('/admin/plants');
            setPlants(response.data);
        } catch (err) {
            setError('Failed to fetch plants');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plant?')) return;
        
        try {
            await api.delete(`/admin/plants/${id}`);
            setPlants(plants.filter(p => p._id !== id));
            toast.success('Plant deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete plant');
        }
    };

    if (loading) return <div>Loading plants...</div>;

    return (
        <div className="manage-plants">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>Manage Plants</h1>
                <Link 
                    to="/admin/plants/add" 
                    style={{
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'bold'
                    }}
                >
                    <FaPlus style={{ marginRight: '10px' }} /> Add New Plant
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Image</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Name</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Category</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Price</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#495057' }}>Stock</th>
                            <th style={{ padding: '15px', textAlign: 'center', color: '#495057' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plants.map((plant) => (
                            <tr key={plant._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '15px' }}>
                                    <img src={plant.image} alt={plant.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50' }}>{plant.name}</td>
                                <td style={{ padding: '15px', color: '#7f8c8d' }}>{plant.category}</td>
                                <td style={{ padding: '15px', color: '#2c3e50' }}>₹{plant.price}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        padding: '5px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: plant.stock > 10 ? '#d4edda' : plant.stock > 0 ? '#fff3cd' : '#f8d7da',
                                        color: plant.stock > 10 ? '#155724' : plant.stock > 0 ? '#856404' : '#721c24'
                                    }}>
                                        {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <Link 
                                        to={`/admin/plants/edit/${plant._id}`}
                                        style={{ color: '#3498db', marginRight: '15px', fontSize: '18px' }}
                                        title="Edit Plant"
                                    >
                                        <FaEdit />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(plant._id)}
                                        style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                        title="Delete Plant"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePlants;
