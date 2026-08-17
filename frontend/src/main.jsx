import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import { CartProvider } from './context/CartContext';
import { WishlistProvider} from './context/WishlistContext';
import { AuthProvider } from "./context/AuthContext";
import './index.css';

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <App />
                </WishlistProvider>
                </CartProvider>
        </AuthProvider>
    </StrictMode>
);