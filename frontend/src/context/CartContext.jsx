import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [ cartItems, setCartItems ] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cart');

            return storedCart
            ? JSON.parse(storedCart)
            : [];
        }catch (error) {
            console.error('Failed to load cart', error);
            return [];
        }
    });

    //Save cart to LocalStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem(
            'cart',
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    //Add product to cart
    const addToCart = (plant, quantity = 1) => {
        if(!plant) {
            return;
        }

        if(plant.stock <= 0) {
            return;
        }

        setCartItems((currentItems) => {
            const plantId = plant._id || plant.id;
            const existingItem = currentItems.find(
                (item) => item._id === plantId
            );

            //Plant already exists in cart
            if(existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                //Don't exceed available stock
                if(newQuantity > plant.stock) {
                    return currentItems;
                }

                return currentItems.map((item) => 
                item._id === plantId
                ? {
                    ...item,
                    quantity: newQuantity,
                }
                : item
            );
        }

            // New plant
            return [
                ...currentItems,
                {
                    ...plant,
                    quantity,
                },
            ];
        });
    }

    //Remove product
    const removeFromCart = (plantId) => {
        setCartItems((currentItems) =>
        currentItems.filter(
            (item) => item._id !==plantId
        )
    );
};

    //Increase Quantity
    const increaseQuantity = (plantId) => {
        
        setCartItems((currentItems) => 
            currentItems.map((item) => {
                if(item._id !== plantId) {
                    return item;
                }
                
                if(item.quantity >= item.stock) {
                    return item;
                }
                
                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            })
        );
    };

    //Decrease Quantity
    const decreaseQuantity = (plantId) => {
        setCartItems((currentItems) => 
            currentItems.map((item) => {

                if(item._id !== plantId) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity - 1,
                };
            })
            .filter(
                (item) => item.quantity > 0
            )
        );
    };

    //Clear entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    //Number of products in cart
    const cartCount = cartItems.reduce(
        (total, item) => 
            total + item.quantity,
        0
    );

    //Get Actual Selling Price
    const getItemPrice = (item) => {

        if (
            item.discountPrice && 
            item.discountPrice < item.price
        ) {
            return item.discountPrice;
        }

        return item.price;
    }

    //Cart subtotal
    const cartSubtotal = cartItems.reduce(
        (total, item) => 
            total + 
            getItemPrice(item) * item.quantity,
        0
    );

    return (
        <CartContext.Provider 
            value={{
                cartItems,
                cartCount,
                cartSubtotal,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                getItemPrice,
            }}
        >
            { children }
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            'useCart must be used inside CartProvider'
        );
    }

    return context;
};