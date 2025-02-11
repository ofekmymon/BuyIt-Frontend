import React from "react";
import MainPage from "./MainPage";
import styles from "./BodyManager.module.css";

export default function BodyManager() {
  return (
    <div>
      <div id="body-manager" className={styles.bodyContainer}>
        {<MainPage />}
      </div>
    </div>
  );
}
