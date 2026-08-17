import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";
import "./UserProfile.css";

const UserProfile = () => {
    const { user, updateUserContext } = useAuth();

    // Edit modes
    const [editMode, setEditMode] = useState({
        personal: false,
        email: false,
        phone: false
    });

    // Form states
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || ""
    });

    const [loading, setLoading] = useState(false);

    const toggleEdit = (section) => {
        setEditMode(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
        
        // Reset form data if cancelling
        if (editMode[section]) {
            setFormData(prev => ({
                ...prev,
                [section === 'personal' ? 'name' : section]: user?.[section === 'personal' ? 'name' : section] || ""
            }));
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async (section) => {
        setLoading(true);
        try {
            const res = await api.put("/users/profile", {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            
            updateUserContext(res.data);
            toast.success("Profile updated successfully!");
            
            // Turn off edit mode
            setEditMode(prev => ({
                ...prev,
                [section]: false
            }));
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="fk-profile-page">
            <div className="fk-profile-container">
                
                {/* Personal Information */}
                <div className="fk-profile-card">
                    <div className="fk-profile-header">
                        <h2>Personal Information</h2>
                        {!editMode.personal && (
                            <button className="fk-profile-edit-btn" onClick={() => toggleEdit('personal')}>Edit</button>
                        )}
                        {editMode.personal && (
                            <button className="fk-profile-cancel-btn" onClick={() => toggleEdit('personal')}>Cancel</button>
                        )}
                    </div>
                    
                    <div className="fk-profile-content">
                        {editMode.personal ? (
                            <div className="fk-profile-edit-form">
                                <div className="fk-input-group">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="fk-profile-input" 
                                        placeholder="Full Name"
                                    />
                                </div>
                                <button 
                                    className="fk-btn-primary" 
                                    onClick={() => handleSave('personal')}
                                    disabled={loading}
                                >
                                    SAVE
                                </button>
                            </div>
                        ) : (
                            <div className="fk-profile-read-only">
                                <input type="text" value={user?.name || ""} disabled className="fk-profile-input-disabled" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Address */}
                <div className="fk-profile-card">
                    <div className="fk-profile-header">
                        <h2>Email Address</h2>
                        {!editMode.email && (
                            <button className="fk-profile-edit-btn" onClick={() => toggleEdit('email')}>Edit</button>
                        )}
                        {editMode.email && (
                            <button className="fk-profile-cancel-btn" onClick={() => toggleEdit('email')}>Cancel</button>
                        )}
                    </div>
                    
                    <div className="fk-profile-content">
                        {editMode.email ? (
                            <div className="fk-profile-edit-form">
                                <div className="fk-input-group">
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className="fk-profile-input" 
                                        placeholder="Email Address"
                                    />
                                </div>
                                <button 
                                    className="fk-btn-primary" 
                                    onClick={() => handleSave('email')}
                                    disabled={loading}
                                >
                                    SAVE
                                </button>
                            </div>
                        ) : (
                            <div className="fk-profile-read-only">
                                <input type="text" value={user?.email || ""} disabled className="fk-profile-input-disabled" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Number */}
                <div className="fk-profile-card">
                    <div className="fk-profile-header">
                        <h2>Mobile Number</h2>
                        {!editMode.phone && (
                            <button className="fk-profile-edit-btn" onClick={() => toggleEdit('phone')}>Edit</button>
                        )}
                        {editMode.phone && (
                            <button className="fk-profile-cancel-btn" onClick={() => toggleEdit('phone')}>Cancel</button>
                        )}
                    </div>
                    
                    <div className="fk-profile-content">
                        {editMode.phone ? (
                            <div className="fk-profile-edit-form">
                                <div className="fk-input-group">
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        className="fk-profile-input" 
                                        placeholder="Mobile Number"
                                    />
                                </div>
                                <button 
                                    className="fk-btn-primary" 
                                    onClick={() => handleSave('phone')}
                                    disabled={loading}
                                >
                                    SAVE
                                </button>
                            </div>
                        ) : (
                            <div className="fk-profile-read-only">
                                <input type="text" value={user?.phone || "+91 "} disabled className="fk-profile-input-disabled" />
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQs Section */}
                <div className="fk-profile-faq">
                    <h2>FAQs</h2>
                    
                    <div className="fk-faq-item">
                        <h4>What happens when I update my email address (or mobile number)?</h4>
                        <p>Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
                    </div>
                    
                    <div className="fk-faq-item">
                        <h4>When will my account be updated with the new email address (or mobile number)?</h4>
                        <p>It happens as soon as you save the changes.</p>
                    </div>
                    
                    <div className="fk-faq-item">
                        <h4>What happens to my existing account when I update my email address (or mobile number)?</h4>
                        <p>Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your Order history, saved information and personal details.</p>
                    </div>

                    <div className="fk-faq-actions">
                        <button className="fk-action-link fk-link-blue">Deactivate Account</button>
                        <button className="fk-action-link fk-link-red">Delete Account</button>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default UserProfile;
