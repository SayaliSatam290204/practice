import { Link, useNavigate } from 'react-router-dom';
import {
    FaLeaf,
    FaHome,
    FaUser,
    FaTachometerAlt,
    FaUsers,
    FaClipboardList,
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt,
} from 'react-icons/fa';

import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const megaMenuData = [
    {
        title: "Indoor & Outdoor",
        links: [
            { name: "Indoor Plants", path: "/plants?categoryGroup=Indoor%20%26%20Outdoor&category=Indoor" },
            { name: "Outdoor Plants", path: "/plants?categoryGroup=Indoor%20%26%20Outdoor&category=Outdoor" }
        ]
    },
    {
        title: "Specialty Plants",
        links: [
            { name: "Bonsai", path: "/plants?categoryGroup=Specialty%20Plants&category=Bonsai" },
            { name: "Succulent", path: "/plants?categoryGroup=Specialty%20Plants&category=Succulent" },
            { name: "Cactus", path: "/plants?categoryGroup=Specialty%20Plants&category=Cactus" },
            { name: "Orchid", path: "/plants?categoryGroup=Specialty%20Plants&category=Orchid" }
        ]
    },
    {
        title: "Garden & Balcony",
        links: [
            { name: "Flowering", path: "/plants?categoryGroup=Garden%20%26%20Balcony&category=Flowering" },
            { name: "Foliage", path: "/plants?categoryGroup=Garden%20%26%20Balcony&category=Foliage" },
            { name: "Hanging Plant", path: "/plants?categoryGroup=Garden%20%26%20Balcony&category=Hanging%20Plant" },
            { name: "Climbing Plant", path: "/plants?categoryGroup=Garden%20%26%20Balcony&category=Climbing%20Plant" }
        ]
    },
    {
        title: "Kitchen Garden",
        links: [
            { name: "Vegetable", path: "/plants?categoryGroup=Kitchen%20Garden&category=Vegetable" },
            { name: "Fruit", path: "/plants?categoryGroup=Kitchen%20Garden&category=Fruit" },
            { name: "Herb", path: "/plants?categoryGroup=Kitchen%20Garden&category=Herb" },
            { name: "Medicinal", path: "/plants?categoryGroup=Kitchen%20Garden&category=Medicinal" },
            { name: "Seeds", path: "/plants?categoryGroup=Kitchen%20Garden&category=Seeds" }
        ]
    }
];

const Navbar = () => {
    const {
        user,
        isAuthenticated,
        isAdmin,
        logout
    } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true});
    };

    return (
        <>
        <header className = 'navbar'>
            <div className = 'navbar-container'>

                {/* Logo */}
                <Link to='/' className='navbar-logo'>
                    <img src='/logo.png' alt='Vrukshavalli Nursery Logo' style={{ height: '40px', objectFit: 'contain' }} />
                </Link>

                {/* Navigation links*/}
                <nav className='navbar-links'>
                    {!isAuthenticated && (
                        <Link 
                        to='/'
                        className='nav-link'
                        >
                            <FaHome />
                                <span>Home</span>
                        </Link>
                    )}

                    <Link 
                    to='/plants'
                    className='nav-link'
                    >
                        <FaLeaf />
                            <span>Plants</span>
                    </Link>

                    {!isAuthenticated && (
                        <>
                            <Link to='/login' className='nav-link'>
                                <FaSignInAlt />
                                <span>Login</span>
                            </Link>
                            <Link to='/register' className='nav-link'>
                                <FaUserPlus />
                                <span>Register</span>
                            </Link>
                        </>
                    )}

                    {isAuthenticated && !isAdmin && (
                        <>
                            <Link to='/profile' className='nav-link'>
                                <FaUser />
                                <span>Profile</span>
                            </Link>
                            <span className='welcome-user'>
                                Welcome, {user?.name}
                            </span>
                            <button className='logout-button' onClick={handleLogout}>
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </>
                    )}

                    {isAuthenticated && isAdmin && (
                        <>
                            <Link to='/admin' className='nav-link'>
                                <FaTachometerAlt />
                                <span>Dashboard</span>
                            </Link>
                            <span className='welcome-user'>
                                Welcome, {user?.name}
                            </span>
                            <button className='logout-button' onClick={handleLogout}>
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </>
                    )}

            </nav>

            </div>

        </header>

        {/* Secondary Navigation Bar (Mega Menu) */}
        <div className="secondary-nav">
            <div className="secondary-nav-container">
                {/* Triggers */}
                {megaMenuData.map((group, index) => (
                    <div key={index} className="mega-menu-item">
                        <span>{group.title}</span>
                    </div>
                ))}
            </div>

            {/* Shared Full-Width Mega Menu Panel */}
            <div className="mega-menu-panel">
                <div className="mega-menu-panel-inner">
                    {megaMenuData.map((group, index) => (
                        <div key={index} className="mega-menu-column">
                            <h4 className="mega-column-title">{group.title}</h4>
                            {group.links.map((link, i) => (
                                <Link key={i} to={link.path} className="mega-dropdown-link">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    );
};

export default Navbar;