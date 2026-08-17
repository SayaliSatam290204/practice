import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
            const loggedInUser = await login(
                formData.email,
                formData.password,
                false
            );

            const from = location.state?.from?.pathname;

            if (loggedInUser.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from || '/', { replace: true });
            }
        } catch (error) {
            const backendError = error.response?.data?.message || '';
            const displayError = backendError.toLowerCase().includes('not found') || backendError.toLowerCase().includes('password')
                ? 'Invalid credentials. Please check your email and password.'
                : (backendError || 'Login failed. Please try again.');
            
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to Plant Nursery</p>
                </div>

                <form className='auth-form' onSubmit={handleSubmit}>
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
                                placeholder='Enter your password'
                                required
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        className='auth-button'
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Login'}
                        {!loading && <FaArrowRight />}
                    </button>
                </form>

                <div className='auth-footer'>
                    <span>Don't have an account?</span>
                    <Link to='/register'>Create an account</Link>
                </div>
            </div>
        </main>
    );
};

export default Login;