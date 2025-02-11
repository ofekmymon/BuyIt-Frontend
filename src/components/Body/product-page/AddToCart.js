import React from "react";
import styles from "./ProductPage.module.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function AddToCart(props) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const product = props.product;
  const user = props.user;
  const queryClient = useQueryClient();
  async function addToCart() {
    const item = {
      quantity,
      product_id: product._id,
    };
    if (user) {
      const request = await axios.post(`${SERVER_URL}/add-cart-item`, {
        product: item,
        email: user.email,
      });
      const response = await request.data.status;
      if (response === "failure") {
        setError("Could not add product. Please try again later");
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find(
        (cartItem) => cartItem.product_id === item.product_id
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.push(item);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    queryClient.invalidateQueries({
      queryKey: ["cart", user ? user.name : ""],
    });
    queryClient.invalidateQueries({
      queryKey: ["navbar-cart", user ? user.name : ""],
    });
  }

  return (
    <div className={styles.buyProductContainer}>
      {error !== "" ? error : ""}
      <h3 className={styles.priceInBuy}>{product.price * quantity}$</h3>
      <div>
        <label htmlFor="quantity">Quantity</label>
        <select
          id="quantity"
          className={styles.quantitySelect}
          onChange={(e) => {
            setQuantity(e.target.value);
          }}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      <button className={styles.addButton} onClick={addToCart}>
        Add To Cart
      </button>
      {/* FOR THE FUTURE - MAKE THE NAME A LINK TO GO TO THE SELLER PAGE AND SEE EVERYTHING THEY ARE SELLING */}
      <div className={styles.soldBy}>Sold By {product.seller}</div>
    </div>
  );
}
