import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaLeaf,
    FaUser,
    FaEnvelope,
    FaLock,
    FaPhone,
    FaMapMarkerAlt,
    FaCity,
    FaMap,
    FaHashtag,
    FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData, false);
            navigate('/', { replace: true });
        } catch (error) {
            const backendError = error.response?.data?.message || '';
            const displayError = backendError.toLowerCase().includes('already exists')
                ? 'An account with this email already exists.'
                : (backendError || 'Registration failed. Please check your details and try again.');
            toast.error(displayError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className='auth-page'>
            <div className='auth-split-image'></div>
            <div className='auth-card'>
                <div className='auth-header'>
                    <div className='auth-icon'>
                        <FaLeaf />
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Plant Nursery and get started</p>
                </div>

                <form className='auth-form' onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='name'>Full Name</label>
                        <div className='input-wrapper'>
                            <FaUser className='input-icon' />
                            <input
                                id='name'
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                placeholder='Enter your name'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='email'>Email Address</label>
                        <div className='input-wrapper'>
                            <FaEnvelope className='input-icon' />
                            <input
                                id='email'
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Enter your email'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <div className='input-wrapper'>
                            <FaLock className='input-icon' />
                            <input
                                id='password'
                                type='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                placeholder='Create a password'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='phone'>Phone Number</label>
                        <div className='input-wrapper'>
                            <FaPhone className='input-icon' />
                            <input
                                id='phone'
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder='Enter phone number'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='address'>Address</label>
                        <div className='input-wrapper'>
                            <FaMapMarkerAlt className='input-icon' />
                            <input
                                id='address'
                                type='text'
                                name='address'
                                value={formData.address}
                                onChange={handleChange}
                                placeholder='Enter your address'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='city'>City</label>
                        <div className='input-wrapper'>
                            <FaCity className='input-icon' />
                            <input
                                id='city'
                                type='text'
                                name='city'
                                value={formData.city}
                                onChange={handleChange}
                                placeholder='Enter your city'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='state'>State</label>
                        <div className='input-wrapper'>
                            <FaMap className='input-icon' />
                            <input
                                id='state'
                                type='text'
                                name='state'
                                value={formData.state}
                                onChange={handleChange}
                                placeholder='Enter your state'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='pincode'>Pincode</label>
                        <div className='input-wrapper'>
                            <FaHashtag className='input-icon' />
                            <input
                                id='pincode'
                                type='text'
                                name='pincode'
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder='Enter pincode'
                                required
                            />
                        </div>
                    </div>

                    <button type='submit' className='auth-button' disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                        {!loading && <FaArrowRight />}
                    </button>
                </form>

                <div className='auth-footer'>
                    <span>Already have an account?</span>
                    <Link to='/login'>Login</Link>
                </div>
            </div>
        </main>
    );
};

export default Register;