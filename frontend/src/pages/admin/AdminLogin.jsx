import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/admin';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const adminUser = await login(formData.email, formData.password, true);

            if (!adminUser || adminUser.role !== 'admin') {
                throw new Error('Not an admin account');
            }

            navigate(from, { replace: true });
        } catch (err) {
            const backendError = err.response?.data?.message || '';
            const displayError = backendError.toLowerCase().includes('not found') || backendError.toLowerCase().includes('password')
                ? 'Invalid credentials.'
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
                        <FaUserShield />
                    </div>
                    <h1>Admin Login</h1>
                    <p>Sign in to access admin dashboard</p>
                </div>

                <form className='auth-form' onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'>Email</label>
                        <div className='input-wrapper'>
                            <FaEnvelope className='input-icon' />
                            <input
                                id='email'
                                name='email'
                                type='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='admin@example.com'
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
                                name='password'
                                type='password'
                                value={formData.password}
                                onChange={handleChange}
                                placeholder='********'
                                required
                            />
                        </div>
                    </div>

                    <button className='auth-button' type='submit' disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <FaSignInAlt />}
                    </button>
                </form>

                <div className='auth-footer'>
                    <span>Not an admin?</span>
                    <Link to='/login'>User Login</Link>
                </div>
            </div>
        </main>
    );
};

export default AdminLogin;
