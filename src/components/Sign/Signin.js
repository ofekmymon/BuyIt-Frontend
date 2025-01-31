import React, { useState } from "react";
import styles from "./Signin.module.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { functionIfEnter } from "../../hooks/useUtilities";
import axios from "axios";

export default function Signin() {
  const [error, setError] = useState("");

  //signin details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  let navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (user) =>
      await axios.post("https://buyit-server.onrender.com/signin", user, {
        withCredentials: true,
      }),
    mutationKey: ["signin"],
  });

  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  // if has redirect (requested to signin from specific point in the site)
  const redirectTo = searchParams.get("redirect") || "/";

  function signin() {
    const user = {
      email,
      password,
      remember,
    };
    mutation.mutate(user, {
      onSuccess: async (response) => {
        await saveLocalCart(email);
        localStorage.setItem("access_token", response.data.access_token);
        queryClient.setQueriesData(["user"], () => response.data.user);
        navigate(redirectTo);
      },
      onError: (error) => {
        console.log("Error signing in:", error.response.data.detail);
        error.response.data.detail === "User Not Found"
          ? setError("User not found")
          : setError("Unexpected Error, please try to log in later");
      },
    });
  }

  const saveLocalCart = async (email) => {
    // if unlogged cart in localstorage was found, return it so it could be saved on the login
    if (localStorage.getItem("cart")) {
      const localCart = JSON.parse(localStorage.getItem("cart"));
      const request = await axios.post(
        "https://buyit-server.onrender.com/save-local-cart",
        { local_cart: localCart, email }
      );
      const response = await request.data;
      if (response.status === "failure") {
        console.log("failed");
        console.log(response);
      }
      console.log(response);
      localStorage.removeItem("cart");
    }
  };

  const handleKeyDown = (event, action) => {
    //handles the enter click to submit
    if (event.key === "Enter") {
      action(); // Trigger signin function when Enter key is pressed
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign in</h2>
      {/* Displays error if error state activated */}
      {error !== "" ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : (
        ""
      )}

      <label htmlFor="email"> Email </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        onKeyDown={handleKeyDown} // Trigger submit on Enter
      />
      <label htmlFor="password"> Password </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        onKeyDown={(e) => functionIfEnter(e, signin)} // Trigger submit on Enter
      />
      {/* if save-user is checked, save user to browser cookies using token or what not */}
      <label htmlFor="save-user" style={{ display: "inline" }}>
        Keep me logged in
        <input
          type="checkbox"
          id="save-user"
          style={{ verticalAlign: "middle" }}
          onChange={() => {
            setRemember(!remember);
          }}
        ></input>
      </label>
      <button
        className={styles.button}
        onClick={signin}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Searching..." : "Log In"}
      </button>
      <Link
        to={
          redirectTo
            ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
            : `/signup`
        }
        style={{ color: "black" }}
      >
        Dont have an account?
      </Link>
    </div>
  );
}
