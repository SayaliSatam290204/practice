import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

import {
    FaUserShield,
    FaUser,
    FaEnvelope,
    FaLock,
    FaPhone,
    FaMapMarkerAlt,
    FaCity,
    FaMap,
    FaHashtag,
    FaUserPlus,
} from "react-icons/fa";


const AdminRegister = () => {

    const { register } = useAuth();

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
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

            const newAdmin = await register(
                formData,
                true
            );


            if (newAdmin.role !== "admin") {

                throw new Error(
                    "Admin registration failed."
                );

            }


            navigate("/admin", {
                replace: true,
            });


        } catch (error) {
            const backendError = error.response?.data?.message || '';
            const displayError = backendError.toLowerCase().includes('already exists')
                ? 'An account with this email already exists.'
                : (backendError || 'Registration failed. Please try again.');
            toast.error(displayError);
        } finally {

            setLoading(false);

        }

    };


    return (

        <main className='auth-page'>
            <div className='auth-split-image'></div>
            <div className='auth-card'>
                <div className="auth-header">

                    <div className="auth-icon">
                        <FaUserShield />
                    </div>

                    <h1>
                        Admin Registration
                    </h1>

                    <p>
                        Create an administrator account
                        for Plant Nursery.
                    </p>

                </div>


                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>

                    {/* Name */}

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <div className="input-wrapper">

                            <FaUser className="input-icon" />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />

                        </div>

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label>
                            Email Address
                        </label>

                        <div className="input-wrapper">

                            <FaEnvelope className="input-icon" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter admin email"
                                required
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <div className="input-wrapper">

                            <FaLock className="input-icon" />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create password"
                                required
                            />

                        </div>

                    </div>


                    {/* Phone */}

                    <div className="form-group">

                        <label>
                            Phone Number
                        </label>

                        <div className="input-wrapper">

                            <FaPhone className="input-icon" />

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                            />

                        </div>

                    </div>


                    {/* Address */}

                    <div className="form-group">

                        <label>
                            Address
                        </label>

                        <div className="input-wrapper">

                            <FaMapMarkerAlt className="input-icon" />

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                                required
                            />

                        </div>

                    </div>


                    {/* City */}

                    <div className="form-group">

                        <label>
                            City
                        </label>

                        <div className="input-wrapper">

                            <FaCity className="input-icon" />

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter your city"
                                required
                            />

                        </div>

                    </div>


                    {/* State */}

                    <div className="form-group">

                        <label>
                            State
                        </label>

                        <div className="input-wrapper">

                            <FaMap className="input-icon" />

                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Enter your state"
                                required
                            />

                        </div>

                    </div>


                    {/* Pincode */}

                    <div className="form-group">

                        <label>
                            Pincode
                        </label>

                        <div className="input-wrapper">

                            <FaHashtag className="input-icon" />

                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                required
                            />

                        </div>

                    </div>


                    {/* Submit */}

                    <div
                        style={{
                            gridColumn: "1 / -1"
                        }}
                    >

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >

                            <FaUserPlus />

                            {loading
                                ? "Creating Account..."
                                : "Create Admin Account"
                            }

                        </button>

                    </div>

                </form>


                {/* Footer */}

                <div className="auth-footer">

                    <span>
                        Already have an admin account?
                    </span>

                    <Link to="/admin/login">
                        Admin Login
                    </Link>

                </div>

            </div>

        </main>

    );

};


export default AdminRegister;