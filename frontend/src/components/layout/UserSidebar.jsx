import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './UserSidebar.css';
import {
    FaUser,
    FaBoxOpen,
    FaShoppingCart,
    FaHeart,
    FaSignOutAlt,
    FaLeaf,
    FaHome,
    FaUserCircle,
    FaChevronRight,
    FaMapMarkerAlt
} from 'react-icons/fa';

const UserSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <aside className="fk-sidebar">
            {/* User Profile Header Block */}
            <div className="fk-sidebar-user">
                <div className="fk-sidebar-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserCircle />}
                </div>
                <div className="fk-sidebar-user-info">
                    <span className="fk-sidebar-hello">Hello,</span>
                    <span className="fk-sidebar-name">{user?.name || "Guest"}</span>
                </div>
            </div>

            {/* Menu Blocks */}
            <div className="fk-sidebar-menu-container">
                
                {/* Orders Block */}
                <div className="fk-sidebar-group">
                    <Link to="/orders" className={`fk-sidebar-item ${location.pathname === '/orders' ? 'active' : ''}`}>
                        <div className="fk-sidebar-item-icon blue-icon"><FaBoxOpen /></div>
                        <div className="fk-sidebar-item-text">MY ORDERS</div>
                        <div className="fk-sidebar-chevron"><FaChevronRight size={12}/></div>
                    </Link>
                </div>

                {/* Account Settings Block */}
                <div className="fk-sidebar-group">
                    <div className="fk-sidebar-group-title">
                        <div className="fk-sidebar-item-icon blue-icon"><FaUser /></div>
                        ACCOUNT SETTINGS
                    </div>
                    <div className="fk-sidebar-subgroup">
                        <Link to="/profile" className={`fk-sidebar-subitem ${location.pathname === '/profile' ? 'active' : ''}`}>
                            Profile Information
                        </Link>
                        <Link to="/addresses" className={`fk-sidebar-subitem ${location.pathname === '/addresses' ? 'active' : ''}`}>
                            Manage Addresses
                        </Link>
                    </div>
                </div>

                {/* My Stuff Block */}
                <div className="fk-sidebar-group">
                    <div className="fk-sidebar-group-title">
                        <div className="fk-sidebar-item-icon blue-icon"><FaHeart /></div>
                        MY STUFF
                    </div>
                    <div className="fk-sidebar-subgroup">
                        <Link to="/wishlist" className={`fk-sidebar-subitem ${location.pathname === '/wishlist' ? 'active' : ''}`}>
                            My Wishlist
                        </Link>
                        <Link to="/cart" className={`fk-sidebar-subitem ${location.pathname === '/cart' ? 'active' : ''}`}>
                            My Cart
                        </Link>
                    </div>
                </div>

                {/* Shop Block (For Nursery specific links) */}
                <div className="fk-sidebar-group">
                    <div className="fk-sidebar-group-title">
                        <div className="fk-sidebar-item-icon blue-icon"><FaLeaf /></div>
                        SHOPPING
                    </div>
                    <div className="fk-sidebar-subgroup">
                        <Link to="/dashboard" className={`fk-sidebar-subitem ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                            Dashboard
                        </Link>
                        <Link to="/plants" className={`fk-sidebar-subitem ${location.pathname === '/plants' ? 'active' : ''}`}>
                            Shop Plants
                        </Link>
                    </div>
                </div>

                {/* Logout */}
                <div className="fk-sidebar-group fk-sidebar-logout" onClick={handleLogout}>
                    <div className="fk-sidebar-item-icon blue-icon" style={{color: '#878787'}}><FaSignOutAlt /></div>
                    <div className="fk-sidebar-item-text" style={{color: '#878787', fontWeight: '500'}}>Logout</div>
                </div>
            </div>
        </aside>
    );
};

export default UserSidebar;
