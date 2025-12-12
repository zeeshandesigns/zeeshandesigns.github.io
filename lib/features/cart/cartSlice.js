import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,
    cartItems: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.total += 1;
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
        }
      }
      state.total -= 1;
    },
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      state.total -= state.cartItems[productId]
        ? state.cartItems[productId]
        : 0;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
    addMultipleToCart: (state, action) => {
      const { items } = action.payload;
      items.forEach(({ productId, quantity }) => {
        if (state.cartItems[productId]) {
          state.cartItems[productId] += quantity;
        } else {
          state.cartItems[productId] = quantity;
        }
        state.total += quantity;
      });
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  deleteItemFromCart,
  addMultipleToCart,
} = cartSlice.actions;

export default cartSlice.reducer;
