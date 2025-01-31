import React from "react";
import styles from "./ContactUs.module.css";
export default function ContactUs() {
  return (
    <div className={styles.container}>
      <div>Please Write to us here (feature currently not available)</div>
      <textarea className={styles.input} />
      <button className={styles.btn}>Send</button>
    </div>
  );
}
