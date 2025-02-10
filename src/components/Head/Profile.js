import React, { useState } from "react";
import styles from "./Profile.module.css";
import { Link, useNavigate } from "react-router-dom";
import { signout } from "../../hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
export default function Profile(props) {
  const [active, setActive] = useState(true);
  const navigate = useNavigate();
  const useQuery = useQueryClient();
  const user = useQuery.getQueryData(["user"]);

  const handleOverlayClick = (e) => {
    // Close the modal if the overlay is clicked (not the profile content)
    if (e.target.id === "overlay") {
      closeOverlay();
    }
  };

  const closeOverlay = () => {
    // function that makes sure the overlay closes smoothly
    setActive(false);
    setTimeout(() => {
      props.close();
    }, 400);
  };

  return (
    <div
      id="overlay"
      className={`${styles.overlay} ${active ? styles.visible : ""}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.container} ${active ? "" : styles.out}`}>
        <h3 className={`${styles.title} `}>
          Hello,
          {/* if loading return loading, after loading decide if user or signin */}
          <Link
            to={`${user ? "/profile-details" : "/signin"}`}
            onClick={() => {
              closeOverlay();
            }}
            style={{ color: "black" }}
          >
            {/* display name if user not null */}
            {user ? user.name : `Sign in`}
          </Link>
        </h3>

        <Link
          to={"/profile-details"}
          className={`${styles.menuOption} ${styles.optionBorder}`}
          onClick={() => {
            closeOverlay();
          }}
        >
          <div>Profile Details</div>
        </Link>

        <Link
          to={"/profile-details?option=Edit Personal Details"}
          className={`${styles.menuOption} ${styles.optionBorder}`}
          onClick={() => {
            closeOverlay();
          }}
        >
          <div>Change Shipping Adderess</div>
        </Link>

        <Link
          to={"/profile-details?option=My Orders"}
          className={`${styles.menuOption} ${styles.optionBorder}`}
          onClick={() => {
            closeOverlay();
          }}
        >
          <div>Your Orders</div>
        </Link>

        <Link
          to={"/sell-products"}
          className={`${styles.menuOption} ${styles.optionBorder}`}
          onClick={() => {
            closeOverlay();
          }}
        >
          <div>Sell A Product</div>
        </Link>

        <Link
          to={"/profile-details?option=Contact Us"}
          className={`${styles.menuOption} ${styles.optionBorder}`}
          onClick={() => {
            closeOverlay();
          }}
        >
          <div>Contact Support</div>
        </Link>
        {/* display signout if user is online */}
        {user ? (
          <div
            className={`${styles.menuOption} ${styles.optionBorder}`}
            onClick={async () => {
              if (await signout()) {
                navigate("/");
                useQuery.removeQueries(["user"]);
                closeOverlay();
              }
            }}
          >
            Sign out
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
