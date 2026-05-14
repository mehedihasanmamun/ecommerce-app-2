import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import axios from "axios";
import { products as localProducts } from "../assets/assets";

export const ShopContext = createContext();

const mergeProducts = (localItems, fetchedItems) => {
  const productMap = new Map();

  localItems.forEach((item) => {
    productMap.set(item._id, item);
  });

  fetchedItems.forEach((item) => {
    productMap.set(item._id, item);
  });

  return [...productMap.values()].sort((a, b) => (b.date || 0) - (a.date || 0));
};

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlistItems");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const toggleWishlist = (itemId) => {
    setWishlistItems((prev) => {
      const updatedWishlist = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      toast.success(
        prev.includes(itemId) ? "Removed from wishlist" : "Added to wishlist",
      );

      return updatedWishlist;
    });
  };

  const isInWishlist = (itemId) => wishlistItems.includes(itemId);

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } },
        );
      } catch (error) {}
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
            console.log(error);
        toast.error(error.message);
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        const fetchedProducts = response.data.products || [];
        setProducts(mergeProducts(localProducts, fetchedProducts));
      } else {
        setProducts(localProducts);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setProducts(localProducts);
      toast.error(error.message);
    }
  };

  const getUserCart = async ( token ) => {
    try {

        const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers:{token}})
        if (response.data.success) {
            setCartItems(response.data.cartData || {})
        }
        
    } catch (error) {
        console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
     if (token) {
        getUserCart(token)
     }
  }, [token]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [wishlistItems]);


  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    wishlistItems,
    addToCart,
    setCartItems,
    toggleWishlist,
    isInWishlist,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
