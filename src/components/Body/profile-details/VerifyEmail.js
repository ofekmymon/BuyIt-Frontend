import React from "react";
import axios from "axios";
import styles from "./VerifyEmail.module.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyEmail(props) {
  const useQuery = useQueryClient();
  const user = useQuery.getQueryData(["user"]);
  const [sendMode, setSendMode] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  // CONTINUE TO CREATE THE CLIENT SIDE AND THEN FINISH THE SERVER SIDE

  const getCode = async () => {
    // asks for the code that gets sent via email.
    const request = await axios.post(
      "https://buyit-server.onrender.com/get-verification-code",
      { email: user.email }
    );

    const response = request.data.status;
    if (response === "success") {
      // causes react query to refetch the data on the next reuqest
      useQuery.invalidateQueries(["user"]);
      setSendMode(true);
    } else {
      setError(request.message);
    }
  };

  const verifyCode = async () => {
    // verifies the code and returns to the profile Details.
    const request = await axios.post(
      "https://buyit-server.onrender.com/verify-verification-code",
      { email: user.email, code: code }
    );
    const response = request.data.status;
    if (response === "success") {
      props.setState("Edit Personal Details");
      useQuery.invalidateQueries(["user"]);
      console.log("good");
    } else {
      setError(request.data.message);
      console.log("bad");
    }
  };

  const handleRendering = () => {
    /* Alternate between asking for code and sending code.*/
    if (sendMode) {
      return (
        <div className={styles.container}>
          {/* Display error if exists */}
          {error !== "" ? <div className={styles.error}>{error}</div> : ""}
          <div className={styles.message}>
            You have recieved a code to your email: {user.email} If not found
            check in your spam
          </div>
          <input
            placeholder="Insert code here"
            maxLength={6}
            type="text"
            className={styles.inputs}
            onChange={(e) => {
              setCode(e.target.value);
            }}
          />
          <button
            className={styles.btn}
            onClick={async () => {
              await verifyCode();
            }}
          >
            Send Code
          </button>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          {/* Display error if exists */}
          {error !== "" ? <div className={styles.error}>{error}</div> : ""}
          <div className={styles.message}>
            We Will send a code to your email: {user.email} that will expire in
            5 minutes
          </div>
          <button
            className={styles.btn}
            onClick={async () => {
              await getCode();
            }}
          >
            Send Code
          </button>
        </div>
      );
    }
  };

  return handleRendering();
}
