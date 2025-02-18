import React from "react";
import styles from "./MyOrders.module.css";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchProductData } from "../../../hooks/useCart";
import { shortenNames } from "../../../hooks/useUtilities";

import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function OrderHistory({ user }) {
  // DISPLAYS THE orderHistory HISTORY
  // IF NO HISTORY DISPLAY A DIV THAT SAYS NO orderHistory :)

  const fetchOrderHistory = async (userId) => {
    try {
      const request = await axios.post(`${SERVER_URL}/fetch-order-history`, {
        id: userId,
      });
      const response = await request.data;
      return response.orders;
    } catch {
      console.log("error : unable to fetch order history");
    }
  };

  const {
    data: orderHistory,
    isError,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["order-history-list", user._id],
    queryFn: () => fetchOrderHistory(user._id),
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: historyData, isFetching: fetchingData } = useQuery({
    queryKey: ["order-history-data", orderHistory],
    queryFn: () => fetchProductData(orderHistory),
    refetchOnWindowFocus: false,
    enabled: orderHistory?.length > 0,
  });

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.navbar} ${styles.noMobile}`}>
        <div></div>
        <div>Order Details</div>
        <div>Date of Order</div>
        <div>Review</div>
      </div>
      {isFetching || fetchingData ? (
        <div className={styles.state}>Loading...</div>
      ) : isError ? (
        <div className={styles.state}>Error! could not find order history</div>
      ) : orderHistory?.length <= 0 ? (
        <div className={styles.state}> No order history found</div>
      ) : (
        historyData?.map((order, i) => (
          <ListedOrder
            key={order._id}
            orderItem={orderHistory[i]}
            product={order}
            userName={user.name}
          />
        ))
      )}
    </div>
  );
}

const ListedOrder = ({ product, orderItem, userName }) => {
  const navigate = useNavigate();

  const checkIfReviewed = (product, userName) => {
    // Function: Checks if the product already has a review of the user
    const result = product.ratings.filter(
      (review) => review.username === userName
    );
    if (result.length > 0) {
      return true;
    }
    return false;
  };

  return (
    <div className={styles.itemContainer}>
      <img
        src={product.images[0]}
        className={styles.itemImage}
        alt="Data not found"
        onClick={() => {
          navigate(`/item-page/${product._id}`);
        }}
      ></img>
      <div className={`${styles.itemDetails} ${styles.category}`}>
        <div className={styles.detail}>
          {shortenNames(product.product_name, 25)}
        </div>
        <div className={styles.detail}>{orderItem.quantity}x</div>
        <div className={styles.detail}>
          {product.price * orderItem.quantity}$
        </div>
      </div>
      <div className={`${styles.detail} ${styles.category}`}>
        {orderItem.ordered_at}
      </div>
      <button
        className={styles.confButton}
        onClick={() => {
          navigate(`/item-page/${product._id}#reviews`);
        }}
      >
        {checkIfReviewed(product, userName) ? "Edit Review" : "Review"}
      </button>
    </div>
  );
};
