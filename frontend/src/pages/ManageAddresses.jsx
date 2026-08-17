import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaEllipsisV } from "react-icons/fa";
import "./ManageAddresses.css";

const ManageAddresses = () => {
    const { user, updateUserContext } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loading, setLoading] = useState(false);

    const initialFormState = {
        name: "",
        phone: "",
        pincode: "",
        addressLine: "",
        city: "",
        state: "",
        type: "Home"
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMenuClick = (id) => {
        if (openMenuId === id) setOpenMenuId(null);
        else setOpenMenuId(id);
    };

    const handleEditClick = (address) => {
        setFormData({
            name: address.name,
            phone: address.phone,
            pincode: address.pincode,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            type: address.type
        });
        setEditingId(address._id);
        setIsAdding(false);
        setOpenMenuId(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (editingId) {
                res = await api.put(`/users/addresses/${editingId}`, formData);
                toast.success("Address updated successfully");
            } else {
                res = await api.post("/users/addresses", formData);
                toast.success("Address added successfully");
            }
            
            // The API returns the updated addresses array
            const updatedUser = { ...user, addresses: res.data };
            updateUserContext(updatedUser);
            handleCancel();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        setLoading(true);
        try {
            const res = await api.delete(`/users/addresses/${id}`);
            const updatedUser = { ...user, addresses: res.data };
            updateUserContext(updatedUser);
            toast.success("Address deleted successfully");
            setOpenMenuId(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete address");
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        setLoading(true);
        try {
            const res = await api.put(`/users/addresses/${id}/default`);
            const updatedUser = { ...user, addresses: res.data };
            updateUserContext(updatedUser);
            toast.success("Default address updated");
            setOpenMenuId(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to set default address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="manage-addresses-page">
            <div className="manage-addresses-container">
                <div className="address-header">
                    <h2>Manage Addresses</h2>
                </div>

                {/* Add New Address Bar */}
                {!isAdding && !editingId && (
                    <div className="add-new-address-bar" onClick={() => setIsAdding(true)}>
                        <span className="add-plus">+</span> ADD A NEW ADDRESS
                    </div>
                )}

                {/* Form (Add or Edit) */}
                {(isAdding || editingId) && (
                    <div className="address-form-container">
                        <h3>{editingId ? "EDIT ADDRESS" : "ADD A NEW ADDRESS"}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-row">
                                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                                <input type="text" name="phone" placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
                                <input type="text" name="city" placeholder="City/District/Town" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="form-row-full">
                                <textarea name="addressLine" placeholder="Address (Area and Street)" value={formData.addressLine} onChange={handleChange} required rows="3" />
                            </div>
                            <div className="form-row">
                                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="form-type-group">
                                <p>Address Type</p>
                                <div className="radio-group">
                                    <label>
                                        <input type="radio" name="type" value="Home" checked={formData.type === "Home"} onChange={handleChange} /> Home
                                    </label>
                                    <label>
                                        <input type="radio" name="type" value="Work" checked={formData.type === "Work"} onChange={handleChange} /> Work
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="fk-btn-primary" disabled={loading}>SAVE</button>
                                <button type="button" className="fk-btn-cancel" onClick={handleCancel}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Saved Addresses List */}
                <div className="saved-addresses-list">
                    {user?.addresses?.map((address) => (
                        <div key={address._id} className="address-card">
                            <div className="address-card-header">
                                <span className="address-badge">{address.type}</span>
                                {address.isDefault && <span className="address-default-badge">DEFAULT</span>}
                                
                                <div className="address-menu-wrapper">
                                    <button className="address-menu-btn" onClick={() => handleMenuClick(address._id)}>
                                        <FaEllipsisV />
                                    </button>
                                    {openMenuId === address._id && (
                                        <div className="address-dropdown-menu">
                                            <div onClick={() => handleEditClick(address)}>Edit</div>
                                            <div onClick={() => handleDelete(address._id)}>Delete</div>
                                            {!address.isDefault && (
                                                <div onClick={() => handleSetDefault(address._id)}>Make Default</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="address-card-body">
                                <div className="address-name-phone">
                                    <span className="address-name">{address.name}</span>
                                    <span className="address-phone">{address.phone}</span>
                                </div>
                                <div className="address-full">
                                    {address.addressLine}, {address.city}, {address.state} - <span className="address-pincode">{address.pincode}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ManageAddresses;
