"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

const STORAGE_KEY = "arhuu_cart";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { id, size } = action.payload;
      const existingIndex = state.findIndex(
        (item) => item.id === id && item.size === size
      );
      if (existingIndex >= 0) {
        const updated = [...state];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.payload.quantity,
        };
        return updated;
      }
      return [...state, { ...action.payload }];
    }
    case "REMOVE_FROM_CART":
      return state.filter((_, i) => i !== action.payload);
    case "UPDATE_QUANTITY": {
      const { index, quantity } = action.payload;
      if (quantity <= 0) return state.filter((_, i) => i !== index);
      const updated = [...state];
      updated[index] = { ...updated[index], quantity };
      return updated;
    }
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1, size = "M") => {
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity,
      },
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((index) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: index });
    toast.success("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((index, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { index, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared");
  }, []);

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
