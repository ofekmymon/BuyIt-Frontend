//Footer, Has miscellaneous options
import React from "react";
import styles from "./Footer.module.css";
export default function EndBody() {
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <a href="./" className={styles.link}>
            About Us (doesnt work)
          </a>
        </li>
        <li className={styles.listItem}>
          <a href="./" className={styles.link}>
            Newest Items (doesnt work)
          </a>
        </li>
        <li className={styles.listItem}>
          <a href="/sell-products" className={styles.link}>
            Sell Products
          </a>
        </li>
        <li className={styles.listItem}>
          <a
            href="/profile-details?option=Edit Personal Details"
            className={styles.link}
          >
            Change Adderess
          </a>
        </li>
        <li className={styles.listItem}>
          <a href="/profile-details?option=My Orders" className={styles.link}>
            Your Orders
          </a>
        </li>
        <li className={styles.listItem}>
          <a href="/profile-details?option=Contact Us" className={styles.link}>
            Contact Us
          </a>
        </li>
      </ul>
    </div>
  );
}
