// Component that allows users to edit their address and name.
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./EditProfileDetails.module.css";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function EditProfileDetails() {
  const useQuery = useQueryClient();
  const user = useQuery.getQueryData(["user"]);
  const [name, setName] = useState(user.name);
  const [nameDisabled, setNameDisabled] = useState(true);
  const [address, setAddress] = useState(user.address);
  const [addressDisabled, setAddressDisabled] = useState(true);
  const [invalidation, setInvalidation] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const verifyDetails = async () => {
    // if name is ok, send request to server to update details. if unsuccessful, gets an error. if successful go to main page
    if (name.length > 12 || name.length < 3) {
      setInvalidation(true);
      return false;
    }
    const editRequest = {
      name: name,
      address: address,
      userValidationEmail: user.email,
    };
    const request = await axios.post(
      `${SERVER_URL}/edit-user-details`,
      editRequest
    );
    const response = await request.data.status;
    if (response === "success") {
      useQuery.invalidateQueries(["user"]);
      navigate("/");
    }
    setError("Could not update user details please try again later");
  };

  return (
    <div className={styles.container}>
      {/* if theres an input error, display it. if there was an error updating the details display it */}
      {invalidation ? (
        <div style={{ color: "red" }}>
          Username must have between 3 to 12 characters
        </div>
      ) : (
        ""
      )}
      {error ? <div style={{ color: "red" }}>{error}</div> : ""}
      <div>
        <label className={styles.labels}>Edit Username</label>
        <input
          className={styles.inputs}
          type="text"
          disabled={nameDisabled}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <button
          className={styles.btn}
          onClick={() => {
            setNameDisabled(!nameDisabled);
          }}
        >
          Edit Name
        </button>
      </div>
      <div>
        {" "}
        <label className={styles.labels}>Edit Address</label>
        <input
          type="text"
          disabled={addressDisabled}
          className={styles.inputs}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
        <button
          className={styles.btn}
          onClick={() => {
            setAddressDisabled(!addressDisabled);
          }}
        >
          Edit Address
        </button>
      </div>
      <button className={styles.buttons} onClick={verifyDetails}>
        Submit
      </button>
    </div>
  );
}
