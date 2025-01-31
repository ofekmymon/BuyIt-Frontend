import React from "react";
import MainPage from "./MainPage";
import styles from "./BodyManager.module.css";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../../hooks/useUser";

export default function BodyManager() {
  return (
    <div>
      <div id="body-manager" className={styles.bodyContainer}>
        {<MainPage />}
      </div>
    </div>
  );
}
