import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems ] =useState(() => {
        try {
            const storedWishlist = localStorage.getItem('wishlist');
            return storedWishlist
            ? JSON.parse(storedWishlist)
            : [];
        } catch (error) {
            console.error(
                'Failed to load wishlist:',
                error
            );

            return [];
        }
    });

    //Save wishlist whenever it changes
    useEffect(() => {
        localStorage.setItem(
            'wishlist',
            JSON.stringify(wishlistItems)
        );
    }, [wishlistItems]);

    //check whether plant is already in wishlist
    const isInWishlist = (plantId) => {

        return wishlistItems.some(
            (item) => item._id === plantId
        );
    };

    //Add plant to wishlist
    const addToWishlist = (plant) => {
        if(!plant) {
            return;
        }

        setWishlistItems((currentItems ) => {
            
            const alreadyExists = currentItems.some(
                (item) => item._id === plant._id
            );

            if(alreadyExists) {
                return currentItems;
            }

            return [
                ...currentItems,
                plant,
            ];
        });
    };

    //Remove plant from wishlist
    const removeFromWishlist = (plantId) => {
        setWishlistItems((currentItems) => 
            currentItems.filter(
            (item) => item._id !== plantId
            )
        );
    };

    //Toggle Wishlist
    const toggleWishlist = (plant) => {
        if (!plant) {
            return;
        }

        if (isInWishlist(plant._id)) {
            removeFromWishlist(plant._id);
        } else {
            addToWishlist(plant);
        }

    };

    //Clear wishlist
    const clearWishlist = () => {
        setWishlistItems([]);
    };

    //Number of wishlist items
    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            { children }
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            'useWishlist must be used inside WishlistProvider'
        );
    }

    return context;
    
};