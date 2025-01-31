import React from "react";
import styles from "./OrderPage.module.css";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCart, fetchProductData } from "../../../hooks/useCart";
import { fetchUser } from "../../../hooks/useUser";
import { shortenNames } from "../../../hooks/useUtilities";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function OrderPage() {
  const { data: user } = useQuery({
    queryKey: ["order-user"],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });

  const { data: cart = [], isFetching } = useQuery({
    queryKey: ["order-cart", user ? user.name : ""],
    queryFn: () => fetchCart(user._id),
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: productData = [], isFetching: fetchingData } = useQuery({
    queryKey: ["order-productData", cart],
    queryFn: () => fetchProductData(cart),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: cart?.length > 0,
    staleTime: 5000 * 60,
  });

  const [address, setAddress] = useState(user?.address ?? "");
  const [checkedItems, setCheckedItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (user && user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const totalCost = () => {
    let totalCost = 0;
    for (let i = 0; i < checkedItems.length; i++) {
      let price = checkedItems[i].quantity * checkedItems[i].price;
      totalCost += price;
    }
    return totalCost.toFixed(2);
  };

  const buyIt = async () => {
    // sends the products in the checkedlist to the db and deletes them from the cart.
    if (!user || checkedItems.length <= 0) return;
    try {
      const responses = await Promise.all(
        checkedItems.map(async (item) => {
          console.log(item.images[0]);

          const order = {
            user_id: user._id,
            product_id: item._id,
            address: address,
            quantity: item.quantity,
          };
          console.log(order);

          const response = await axios.post(
            "https://buyit-server.onrender.com/upload-order",
            order
          );
          return await response.data;
        })
      );
      return responses;
    } catch (error) {
      console.error(error);

      if (error.response) {
        throw new Error(
          error.response.data?.error || "Order submission failed"
        );
      } else {
        throw new Error("Unable to connect to the server. Please try again.");
      }
    }
  };
  const mutateOrder = useMutation({
    mutationFn: buyIt,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart", user ? user.name : ""],
      });
      queryClient.invalidateQueries({
        queryKey: ["navbar-cart", user ? user.name : ""],
      });
      navigate("/");
    },
    onError: () => {
      setError("Unable to complete purchase. Please try again later");
    },
  });
  return (
    <div className={styles.container}>
      <div className={styles.paymentInfo}>
        <p className={styles.paymentTitle}>Payment Info:</p>
        Theres no need to enter any payment information, this is a project
      </div>
      <div className={styles.productContainer}>
        {/* runs a loop to render cart items */}
        {isFetching || fetchingData ? (
          <div className={styles.alert}>Loading...</div>
        ) : productData.length === 0 ? (
          <div className={styles.alert}>No products found</div>
        ) : (
          productData.map((product, index) => (
            <CartItem
              key={product._id}
              product={product}
              cartItem={cart[index]}
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
            />
          ))
        )}
      </div>
      <div className={styles.addressContainer}>
        <div className={styles.finalPrice}>Final Price: {totalCost()}$</div>

        <label htmlFor="shippingAddress">Shipping Address</label>
        <input
          id="shippingAddress"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
        <div>
          {user
            ? `Making Purchase for User: ${user.name}`
            : "Cant make purchases without signing in first"}
        </div>
        <p className={styles.error}>{error}</p>
      </div>
      <button
        className={styles.buyButton}
        disabled={mutateOrder.isPending}
        onClick={async () => {
          address.length < 5
            ? setError("Please enter a valid address")
            : checkedItems.length > 0
            ? mutateOrder.mutate()
            : setError("Please select at least one item");
        }}
      >
        {mutateOrder.isPending ? "Loading.." : "BuyIt!"}
      </button>
    </div>
  );
}

const CartItem = ({ product, cartItem, setCheckedItems }) => {
  return (
    <div className={styles.product}>
      <img src={product.images[0]} alt="" className={styles.productImage}></img>
      <div className={styles.productDetails}>
        <p className={`${styles.productName} ${styles.productDetail}`}>
          {shortenNames(product.name, 40)}
        </p>
        <p className={`${styles.productPrice} ${styles.productDetail}`}>
          {product.price}$
        </p>
        <p className={`${styles.productQuantity} ${styles.productDetail}`}>
          {cartItem.quantity}x
        </p>
      </div>
      <input
        className={styles.includeBox}
        type="checkbox"
        onChange={(e) => {
          setCheckedItems((prevItems) => {
            if (e.target.checked) {
              return [
                ...prevItems,
                { ...product, quantity: cartItem.quantity },
              ];
            }
            return prevItems.filter((item) => item._id !== product._id);
          });
        }}
      />
    </div>
  );
};
