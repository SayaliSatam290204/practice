import { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './authContextObject';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState( ()=> {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(
        localStorage.getItem('token') || null
    );

    //login User or Admin
    const login = async( email, password, isAdmin = false) => {
        const endpoint = isAdmin
        ? 'auth/login/admin'
        : 'auth/login/user';

    const response = await api.post(endpoint, {
        email,
        password,
    });

    const { 
        token: newToken, 
        user: loggedInUser, 
        admin 
    } = response.data;

    const resolvedUser = loggedInUser || admin;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(resolvedUser));

    setToken(newToken);
    setUser(resolvedUser);

    return resolvedUser;
    };

    //Register USer or Admin
    const register = async ( formData, isAdmin = false) => {
        const endpoint = isAdmin
        ? 'auth/register/admin'
        : 'auth/register/user';

    const response = await api.post(
        endpoint,
        formData
    );

    const {
        token: newToken,
        user: newUser,
        admin
    } = response.data;

    const resolvedUser = newUser || admin;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(resolvedUser));

    setToken(newToken);
    setUser(resolvedUser);

    return resolvedUser;
    };

    //Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    // Update User manually
    const updateUserContext = (newUser) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider
        value = {{
            user,
            token,
            login,
            register,
            logout,
            updateUserContext,
            isAuthenticated: !!token,
            isAdmin: user?.role === 'admin',
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}
