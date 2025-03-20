import React, { useState } from "react";
import styles from "./CartPopUp.module.css";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { MdCancel } from "react-icons/md";
import { shortenNames } from "../../hooks/useUtilities";
import { useNavigate } from "react-router-dom";
import {
  fetchCart,
  fetchProductData,
  getTotalCost,
  fetchGuestCart,
} from "../../hooks/useCart";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function CartPopUp(props) {
  const [active, setActive] = useState(true);
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]);
  const navigate = useNavigate();

  const { data: cart = [], isFetching } = useQuery({
    queryKey: ["cart", user ? user.name : ""],
    queryFn: () => (user ? fetchCart(user._id) : fetchGuestCart()),
    refetchOnWindowFocus: false,
  });

  const {
    data: productData = [],
    isLoading,
    isFetching: fetchingData,
  } = useQuery({
    queryKey: ["productData", cart],
    queryFn: () => fetchProductData(cart),
    refetchOnWindowFocus: false,
    enabled: cart?.length > 0,
  });

  const deleteCartItemFromServer = async (product) => {
    console.log(product);

    const request = await axios.post(`${SERVER_URL}/cart/delete-cart-item`, {
      email: user.email,
      product,
    });
    const response = await request.data;
    if (response.status === "failure") {
      alert("Error, item could not be removed, Please try again later");
    }
    return response;
  };

  const deleteLocalCartItem = (product) => {
    // if item is in localstorage, deletes from localstorage
    console.log(product);

    console.log("trying to delete from local");
    const id = product.product_id;
    const localCart = JSON.parse(localStorage.getItem("cart"));
    if (!localCart) return;
    const itemToDelete = localCart.find((item) => item.product_id === id);
    if (itemToDelete) {
      localCart.splice(localCart.indexOf(itemToDelete), 1);
      localStorage.setItem("cart", JSON.stringify(localCart));
    }
  };

  const deleteCartItemMutation = useMutation({
    // deletes item from db or localstorage (based on if theres a user)
    mutationFn: async (product) =>
      user
        ? await deleteCartItemFromServer(product)
        : deleteLocalCartItem(product),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart", user ? user.name : ""],
      });
      queryClient.invalidateQueries({
        queryKey: ["navbar-cart", user ? user.name : ""],
      });
    },
  });

  const handleOverlayClick = (e) => {
    // Close the modal if the overlay is clicked (not the cart content)
    if (e.target.id === "overlay") {
      handleClose();
    }
  };

  const handleClose = () => {
    setActive(false); // Trigger popOut animation
    setTimeout(() => {
      props.close(); // Close after the animation duration
    }, 200); // Matches the duration of popOut animation (0.2s)
  };

  return (
    <div
      id="overlay"
      className={`${styles.overlay} ${active ? styles.visible : ""}`}
      onClick={handleOverlayClick}
    >
      {/* Display loading if in loading state */}
      <div className={`${styles.container} ${active ? "" : styles.out}`}>
        <h2 className={styles.title}>Your Cart</h2>
        <div className={styles.cartBody}>
          {/* runs a loop to render cart items */}
          {isFetching || isLoading || fetchingData ? (
            <div className={styles.alert}>Loading...</div>
          ) : (
            productData?.map((product, index) => (
              <CartItem
                key={product._id}
                product={product}
                cartItem={cart[index]}
                deleteCartItem={deleteCartItemMutation}
              />
            ))
          )}
        </div>
        <div className={styles.summery}>
          <button
            className={`${styles.cartButton} ${styles.leftButton}`}
            onClick={() => {
              navigate("/order");
              handleClose();
            }}
          >
            BuyIt
          </button>
          <p className={styles.price}>
            Total : {getTotalCost(cart, productData) || 0}$
          </p>
          <button
            className={`${styles.cartButton} ${styles.rightButton}`}
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const CartItem = ({ product, cartItem, deleteCartItem }) => {
  return (
    <div className={styles.cartItem}>
      <img src={product.images[0]} alt="" className={styles.itemImage}></img>
      <p className={styles.itemDetail}>{shortenNames(product.name, 10)}</p>
      <p className={styles.itemDetail}>{cartItem.quantity}x</p>
      <p className={styles.itemDetail}>{product.price * cartItem.quantity}$</p>
      <MdCancel
        className={styles.productDelete}
        onClick={() => {
          console.log("clicked");

          deleteCartItem.mutate(cartItem);
        }}
      />
    </div>
  );
};
