import React, { useEffect } from "react";
import styles from "./ProfileDetails.module.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import EditProfileDetails from "./EditProfileDetails";
import VerifyEmail from "./VerifyEmail";
import MyOrders from "./MyOrders";
import OrdersHistory from "./OrdersHistory";
import ContactUs from "./ContactUs";
export default function ProfileDetails() {
  const [currentOption, setCurrentOption] = useState("Edit Personal Details");
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const useQuery = useQueryClient();
  const user = useQuery.getQueryData(["user"]);

  useEffect(() => {
    const option = searchParams.get("option");
    if (option) {
      setCurrentOption(option);
    }
  }, [searchParams]);

  const changeDisplay = () => {
    switch (currentOption) {
      default:
        if (error !== true) {
          setError(true);
        }
        return <div>Page Not found</div>;
      case "Edit Personal Details":
        return <EditProfileDetails />;
      case "Verify Account":
        return <VerifyEmail setState={setCurrentOption} />;
      case "My Orders":
        return <MyOrders user={user} />;
      case "Orders History":
        return <OrdersHistory user={user} />;
      case "Contact Us":
        return <ContactUs />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.categoryBar}>
        <div
          onClick={(e) => {
            setCurrentOption(e.target.textContent);
          }}
        >
          Edit Personal Details
        </div>
        {/* if user not verified display the option to verify */}
        {/* here are the options displayed: */}
        {!user.verified ? (
          <div
            onClick={(e) => {
              setCurrentOption(e.target.textContent);
            }}
          >
            Verify Account
          </div>
        ) : (
          ""
        )}

        <div
          onClick={(e) => {
            setCurrentOption(e.target.textContent);
          }}
        >
          My Orders
        </div>
        <div
          onClick={(e) => {
            setCurrentOption(e.target.textContent);
          }}
        >
          Orders History
        </div>
        <div
          onClick={(e) => {
            setCurrentOption(e.target.textContent);
          }}
        >
          Contact Us
        </div>
      </div>
      <div className={styles.navbar}>{!error ? currentOption : ""}</div>
      <div className={styles.componentContainer}> {changeDisplay()} </div>
    </div>
  );
}
