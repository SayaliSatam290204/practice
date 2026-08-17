import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";

import Home from "./Home";

import Plants from "./pages/Plants";
import PlantDetails from "./pages/PlantDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import UserProfile from "./pages/UserProfile";
import ManageAddresses from "./pages/ManageAddresses";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import Invoice from "./pages/Invoice";

import Navbar from "./components/layout/Navbar";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";

import UserSidebar from "./components/layout/UserSidebar";
import { useAuth } from "./hooks/useAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePlants from "./pages/admin/ManagePlants";
import PlantForm from "./pages/admin/PlantForm";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageReviews from "./pages/admin/ManageReviews";
import ManageCoupons from "./pages/admin/ManageCoupons";



const AppContent = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();
    
    // Hide navbar on admin routes and invoice routes
    const isPrintRoute = location.pathname.includes('/invoice');
    const hideNavbar = location.pathname.startsWith('/admin') || isPrintRoute;

    const routing = (
        <Routes>

            {/* =========================
                PUBLIC ROUTES
            ========================== */}

            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
                    ) : (
                        <Home />
                    )
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =========================
                ADMIN AUTH ROUTES
            ========================== */}

            <Route
                path="/admin/login"
                element={<AdminLogin />}
            />

            <Route
                path="/admin/register"
                element={<AdminRegister />}
            />


            {/* =========================
                PLANT ROUTES
            ========================== */}

            <Route
                path="/plants"
                element={<Plants />}
            />

            <Route
                path="/plants/:id"
                element={<PlantDetails />}
            />


            {/* =========================
                CART & WISHLIST
            ========================== */}

            <Route
                path="/cart"
                element={<Cart />}
            />

            <Route
                path="/wishlist"
                element={<Wishlist />}
            />


            {/* =========================
                CHECKOUT
            ========================== */}

            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                USER ORDERS
            ========================== */}

            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <Orders />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/order-success"
                element={
                    <ProtectedRoute>
                        <OrderSuccess />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/orders/:id/invoice"
                element={
                    <ProtectedRoute>
                        <Invoice />
                    </ProtectedRoute>
                }
            />

            {/* =========================
                USER PROFILE & DASHBOARD
            ========================== */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/addresses"
                element={
                    <ProtectedRoute>
                        <ManageAddresses />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                ADMIN DASHBOARD
            ========================== */}

            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="plants" element={<ManagePlants />} />
                <Route path="plants/add" element={<PlantForm />} />
                <Route path="plants/edit/:id" element={<PlantForm />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="reviews" element={<ManageReviews />} />
                <Route path="coupons" element={<ManageCoupons />} />
            </Route>

            {/* =========================
                404 NOT FOUND
            ========================== */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );

    if (isAuthenticated && !isAdmin) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
                <UserSidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {routing}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!hideNavbar && <Navbar />}
            <main style={{ flex: 1 }}>
                {routing}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <AppContent />
        </BrowserRouter>
    );
};

export default App;