import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaTachometerAlt, FaLeaf, FaBoxOpen, FaSignOutAlt, FaHome, FaUsers, FaStar, FaTag } from 'react-icons/fa';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navLinks = [
        { path: '/admin', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/admin/plants', name: 'Manage Plants', icon: <FaLeaf /> },
        { path: '/admin/orders', name: 'Manage Orders', icon: <FaBoxOpen /> },
        { path: '/admin/users', name: 'Manage Users', icon: <FaUsers /> },
        { path: '/admin/reviews', name: 'Manage Reviews', icon: <FaStar /> },
        { path: '/admin/coupons', name: 'Manage Coupons', icon: <FaTag /> },
        { path: '/', name: 'Back to Shop', icon: <FaHome /> }
    ];

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <aside className="admin-sidebar" style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
                <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #34495e', textAlign: 'center' }}>
                    Plant Nursery<br/><span style={{fontSize: '14px', color: '#1abc9c'}}>Admin Panel</span>
                </div>
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link 
                                    to={link.path} 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px 20px',
                                        color: location.pathname === link.path ? '#1abc9c' : '#ecf0f1',
                                        textDecoration: 'none',
                                        backgroundColor: location.pathname === link.path ? '#34495e' : 'transparent',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <span style={{ marginRight: '10px' }}>{link.icon}</span>
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
                    <button 
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '16px'
                        }}
                    >
                        <FaSignOutAlt style={{ marginRight: '10px' }} />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="admin-main" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
