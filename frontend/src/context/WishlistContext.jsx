import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';

import {
    getWishlist as fetchWishlist,
    toggleWishlist as apiToggleWishlist
} from '../services/api';

import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();

    const [wishlist, setWishlist] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    const loadWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            setWishlistCount(0);
            return;
        }

        try {
            const { data } = await fetchWishlist();

            setWishlist(data.data || []);
            setWishlistCount(data.data?.length || 0);
        } catch {
            setWishlist([]);
            setWishlistCount(0);
        }
    }, [user]);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    const isWishlisted = (bookId) => {
        return wishlist.some(
            (book) => book._id === bookId
        );
    };

    const toggleWishlist = async (bookId) => {
        try {
            const { data } = await apiToggleWishlist(bookId);

            await loadWishlist();

            toast.success(data.message);

            return data.isWishlisted;
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                'Wishlist update failed'
            );

            return false;
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistCount,
                loadWishlist,
                toggleWishlist,
                isWishlisted
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);

    if (!ctx) {
        throw new Error(
            'useWishlist must be used inside WishlistProvider'
        );
    }

    return ctx;
};