import React, { useState } from "react";
import Logo from "../componentsImages/logo.png";
import styles from "./Navbar.module.css";
import SearchBar from "./SearchBar";
import Profile from "./Profile";
import { IoCartOutline } from "react-icons/io5";
import CartPopUp from "./CartPopUp";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../hooks/useUser";
import { fetchCart, fetchGuestCart } from "../../hooks/useCart";

export default function Navbar() {
  const [cart, setCart] = useState(false);
  const [profile, setProfile] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
  const { data: cartData } = useQuery({
    queryKey: ["navbar-cart", user ? user.name : ""],
    queryFn: () => (user ? fetchCart(user._id) : fetchGuestCart()),
    refetchOnWindowFocus: true,
  });

  // handles profile
  function returnProfile() {
    // function to close profile
    function closeProfile() {
      setProfile(false);
    }
    if (profile) {
      return <Profile close={closeProfile} />;
    }
  }
  // handles cart
  function returnCart() {
    // function to close the cart
    function closeCart() {
      setCart(false);
    }
    // if cart true return cart prop
    if (cart) {
      return <CartPopUp close={closeCart} className={styles.cartPopUp} />;
    }
  }

  return (
    <div id="container" className={styles.container}>
      {returnCart()}
      {returnProfile()}
      <div
        className={`${styles.tag} ${styles.noMobile}`}
        id="profile"
        onClick={() => {
          setProfile(true);
        }}
      >
        Your Profile
      </div>
      {/* Hamburger widget for mobile */}
      <div
        className={`${styles.mobile} ${styles.hamburgerContainer}`}
        onClick={() => {
          setProfile(true);
        }}
      >
        <div className={styles.hamburger}></div>
        <div className={styles.hamburger}></div>
        <div className={styles.hamburger}></div>
      </div>
      {/* user greeting (if loading display loading) */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Link to={"/profile-details"} style={{ textDecoration: "none" }}>
          <div className={`${styles.tag} ${styles.welcomeContainer}`}>
            <span className={`${styles.welcome}`} id="user-welcome">
              Welcome
            </span>
            {/* invisible space */}
            <span className={styles.noMobile} style={{ opacity: "0" }}>
              s
            </span>
            <span className={`${styles.name}`}>
              {user ? user.name.split(" ")[0] : "Guest"}
            </span>
          </div>
        </Link>
      )}
      <Link to={"/"}>
        <img src={Logo} alt="BuyIt" className={styles.logo} />
      </Link>
      {<SearchBar />}
      <Link
        className={`${styles.tag} ${styles.noMobile}`}
        to={"/profile-details?option=My Orders"}
      >
        My Orders
      </Link>
      <div
        // click event on the cart container to open cart
        className={styles.cartContainer}
        onClick={() => {
          setCart(!cart);
        }}
      >
        <IoCartOutline size={"40px"} />
        <div className={`${styles.myCart} ${styles.noMobile}`}>
          <div>My Cart</div>
          <span className={`${styles.cartLength} `}>
            {cartData?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
