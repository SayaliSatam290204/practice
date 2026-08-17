import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const PlantForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        scientificName: '',
        category: 'Indoor',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        height: '',
        potSize: '',
        sunlight: '',
        watering: '',
        temperature: '',
        fertilizer: '',
        isIndoor: true,
        isOutdoor: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categoryStructure = {
        "Indoor & Outdoor": ["Indoor", "Outdoor"],
        "Specialty Plants": ["Bonsai", "Succulent", "Cactus", "Orchid"],
        "Garden & Balcony": ["Flowering", "Foliage", "Hanging Plant", "Climbing Plant"],
        "Kitchen Garden": ["Vegetable", "Fruit", "Herb", "Medicinal", "Seeds"]
    };

    const [parentCategory, setParentCategory] = useState("Indoor & Outdoor");

    useEffect(() => {
        if (isEdit) {
            const fetchPlant = async () => {
                try {
                    const response = await api.get(`/plants/${id}`);
                    const plant = response.data;
                    setFormData({
                        name: plant.name,
                        scientificName: plant.scientificName || '',
                        category: plant.category || 'Indoor',
                        description: plant.description || '',
                        price: plant.price || '',
                        discountPrice: plant.discountPrice || '',
                        stock: plant.stock || '',
                        height: plant.height || '',
                        potSize: plant.potSize || '',
                        sunlight: plant.sunlight || '',
                        watering: plant.watering || '',
                        temperature: plant.temperature || '',
                        fertilizer: plant.fertilizer || '',
                        isIndoor: plant.isIndoor || false,
                        isOutdoor: plant.isOutdoor || false
                    });
                    
                    const foundParent = Object.keys(categoryStructure).find(parent => 
                        categoryStructure[parent].includes(plant.category)
                    );
                    if (foundParent) {
                        setParentCategory(foundParent);
                    }

                    if (plant.image) {
                        setPreviewImage(plant.image);
                    }
                } catch (err) {
                    setError('Failed to fetch plant details');
                }
            };
            fetchPlant();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('scientificName', formData.scientificName);
        data.append('categoryGroup', parentCategory);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('discountPrice', formData.discountPrice);
        data.append('stock', formData.stock);
        data.append('height', formData.height);
        data.append('potSize', formData.potSize);
        data.append('sunlight', formData.sunlight);
        data.append('watering', formData.watering);
        data.append('temperature', formData.temperature);
        data.append('fertilizer', formData.fertilizer);
        data.append('isIndoor', formData.isIndoor);
        data.append('isOutdoor', formData.isOutdoor);

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.put(`/plants/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/plants/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/plants');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save plant');
            setLoading(false);
        }
    };

    return (
        <div className="plant-form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/admin/plants" style={{ color: '#7f8c8d', marginRight: '15px', fontSize: '20px' }}>
                    <FaArrowLeft />
                </Link>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>{isEdit ? 'Edit Plant' : 'Add New Plant'}</h1>
            </div>

            {error && <div className="error-message" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Scientific Name</label>
                        <input type="text" name="scientificName" value={formData.scientificName} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category Group</label>
                        <select 
                            value={parentCategory} 
                            onChange={(e) => {
                                setParentCategory(e.target.value);
                                setFormData({...formData, category: categoryStructure[e.target.value][0]});
                            }} 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        >
                            {Object.keys(categoryStructure).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sub-Category *</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        >
                            {categoryStructure[parentCategory].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Stock *</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (₹) *</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Discount Price (₹)</label>
                        <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} min="0" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}></textarea>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Plant Image {isEdit ? '' : '*'}</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} required={!isEdit} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '10px' }} />
                    {previewImage && (
                        <div>
                            <img src={previewImage} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                        </div>
                    )}
                </div>

                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#2c3e50' }}>Plant Specifications</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Height</label>
                        <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 30-40 cm" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Pot Size</label>
                        <input type="text" name="potSize" value={formData.potSize} onChange={handleChange} placeholder="e.g. 6 inch" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sunlight</label>
                        <input type="text" name="sunlight" value={formData.sunlight} onChange={handleChange} placeholder="e.g. Partial Sun" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Watering</label>
                        <input type="text" name="watering" value={formData.watering} onChange={handleChange} placeholder="e.g. Every 10-15 days" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <input type="checkbox" name="isIndoor" checked={formData.isIndoor} onChange={handleChange} style={{ marginRight: '10px' }} />
                                Indoor Plant
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <input type="checkbox" name="isOutdoor" checked={formData.isOutdoor} onChange={handleChange} style={{ marginRight: '10px' }} />
                                Outdoor Plant
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/admin/plants" style={{ padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', color: '#7f8c8d', marginRight: '15px', fontWeight: 'bold' }}>Cancel</Link>
                    <button type="submit" disabled={loading} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '5px', display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                        <FaSave style={{ marginRight: '10px' }} /> {loading ? 'Saving...' : 'Save Plant'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PlantForm;
