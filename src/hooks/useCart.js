import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const fetchCart = async (id) => {
  const response = await axios.post(`${SERVER_URL}/cart/get-cart`, {
    id,
  });
  return response.data.cart;
};

export const fetchProductData = async (cart) => {
  if (!cart || cart.length === 0) return [];
  const responses = await Promise.all(
    cart.map((item) =>
      axios.get(`${SERVER_URL}/products/fetch-product`, {
        params: { id: item.product_id },
      })
    )
  );
  return responses.map((res) => res.data.product);
};

export const getTotalCost = (cart, productData) => {
  // uses productData to calculate the total price of items. if there is a bug and -
  // product data is missing at an index it will return 0
  const total = cart
    ? cart.reduce(
        (total, product, index) =>
          total + productData[index]?.price * product.quantity,
        0
      )
    : 0;
  return total.toFixed(2);
};

export const fetchGuestCart = () => {
  const items = localStorage.getItem("cart");
  return JSON.parse(items) || [];
};
