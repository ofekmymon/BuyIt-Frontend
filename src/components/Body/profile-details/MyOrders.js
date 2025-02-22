import React from "react";
import styles from "./MyOrders.module.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { shortenNames } from "../../../hooks/useUtilities";
import { fetchProductData } from "../../../hooks/useCart";
import { useState } from "react";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

async function deleteOrder(userId, orderDetails) {
  const request = await axios.post(`${SERVER_URL}/delete-order`, {
    user_id: userId,
    order_id: orderDetails.order_id,
    product_id: orderDetails.product_id,
    quantity: orderDetails.quantity,
    order_date: orderDetails.order_date,
  });
  const response = await request.data;
  if (response.status !== "success") {
    alert("Error confirming order. Please try again later");
  }
  console.log("order confirmed");
}

const ListedOrder = ({ product, orderItem, setOrderDetails }) => {
  const navigate = useNavigate();
  console.log(product);

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
        {orderItem.order_date}
      </div>
      <div className={`${styles.detail} ${styles.category}`}>
        {orderItem.order_status}
      </div>
      <button
        className={`${styles.confButton}`}
        onClick={() => {
          setOrderDetails(orderItem);
        }}
      >
        Confirm Order
      </button>
    </div>
  );
};

const ConfirmWindow = ({ setOrderDetails, userId, orderDetails }) => {
  const queryClient = useQueryClient();

  const deleteOrdersMutation = useMutation({
    mutationFn: async () => {
      await deleteOrder(userId, orderDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([["orders-list", userId]]);
      setOrderDetails("");
    },
    onError: () => {
      alert("Error confirming order. Please try again later");
    },
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.windowContainer}>
        <h3>Have you picked up the order?</h3>
        <div className={styles.buttonContainer}>
          <button
            className={styles.btn}
            onClick={() => {
              setOrderDetails("");
            }}
          >
            Cancel
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              deleteOrdersMutation.mutate();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyOrders({ user }) {
  const [orderDetails, setOrderDetails] = useState("");

  const fetchOrders = async () => {
    const request = await axios.post(`${SERVER_URL}/fetch-orders`, {
      id: user._id,
    });
    return await request.data.orders;
  };
  const {
    data: orders,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["orders-list", user._id],
    queryFn: fetchOrders,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: orderData, isFetching: fetchingData } = useQuery({
    queryKey: ["order-data ", orders],
    queryFn: () => fetchProductData(orders),
    refetchOnWindowFocus: false,
    enabled: orders?.length > 0,
  });

  // DISPLAYS THE CURRENT ORDERS
  // IF NO ORDERS DISPLAY A DIV THAT SAYS NO CURRENT ORDERS :)
  return (
    <div
      id="overlay"
      className={`${styles.container} ${
        orderDetails !== "" ? styles.overlay : ""
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOrderDetails("");
        }
      }}
    >
      <div className={`${styles.navbar} ${styles.noMobile}`}>
        <div></div>
        <div>Order Details</div>
        <div>Date of Order</div>
        <div>Status</div>
        <div>Confirm Order</div>
      </div>
      {isFetching || fetchingData ? (
        <div className={styles.state}>Loading...</div>
      ) : isError ? (
        <div className={styles.state}>Error! Could not find orders</div>
      ) : orders?.length <= 0 ? (
        <div className={styles.state}> No Orders Found</div>
      ) : (
        orderData?.map((order, i) => (
          <ListedOrder
            orderItem={orders[i]}
            product={order}
            key={`${order._id} ${i}`}
            setOrderDetails={setOrderDetails}
          />
        ))
      )}
      {orderDetails !== "" && (
        <ConfirmWindow
          setOrderDetails={setOrderDetails}
          userId={user._id}
          orderDetails={orderDetails}
        />
      )}
    </div>
  );
}
