import React, { useState } from "react";
import styles from "./Signup.module.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
var validator = require("email-validator");

export default function Signup() {
  //state to yell the user where they entered invalid info first
  const [invalid, setInvalidation] = useState("");
  const [error, setError] = useState("");
  let navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const mutation = useMutation({
    mutationFn: async (newUser) =>
      await axios.post("https://buyit-server.onrender.com/signup", newUser),
  });

  function validateForm(event) {
    // name between 3-12 chars
    // email validated
    // password between 4-12 chars can have anything but spaces.
    event.preventDefault();
    const form = event.target;
    const name = form["name"].value;
    const email = form["email"].value;
    const password = form["password"].value;
    const confPassword = form["conf-password"].value;

    if (name.length > 12 || name.length < 3) {
      setInvalidation("username");
      return false;
    }
    if (!validator.validate(email)) {
      setInvalidation("email");
      return false;
    }
    if (password.length > 12 || password.length < 4 || /\s/.test(password)) {
      setInvalidation("password");
      return false;
    }
    if (confPassword !== password) {
      setInvalidation("conf");
      return false;
    }
    const user = {
      name,
      email,
      password,
    };
    mutation.mutate(user, {
      onSuccess: () => {
        console.log(`User ${user.name} Created Successfuly`);
        navigate(
          redirectTo
            ? `/signin?redirect=${encodeURIComponent(redirectTo)}`
            : "/signin"
        );
      },
      onError: (error) => {
        console.error("Error signing up:", error.response.data.detail);
        error.response.data.detail === "Email already registered"
          ? setError("Email already registered Please try to log in")
          : setError("Unexpected Error, please try to signup later");
      },
    });
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>SignUp</h2>
      <form className={styles.form} onSubmit={validateForm}>
        {/* Displays error in the spot the state caught an invalidation or error to signup */}
        {error !== "" ? (
          <div style={{ color: "red", textAlign: "center" }}>{error}</div>
        ) : (
          ""
        )}
        {/* name */}
        <label htmlFor="user-name" className={styles.labels}>
          Name
        </label>
        {invalid === "username" ? (
          <div style={{ color: "red" }}>
            Username must have between 3 to 12 characters
          </div>
        ) : (
          ""
        )}
        <input type="text" id="user-name" name="name" />
        {/* email */}
        <label htmlFor="user-email" className={styles.labels}>
          Email
        </label>
        {invalid === "email" ? (
          <div style={{ color: "red" }}> Email invalid </div>
        ) : (
          ""
        )}

        <input type="email" id="user-email" name="email" />
        {/* password */}
        <label htmlFor="user-name" className={styles.labels}>
          Password
        </label>
        {invalid === "password" ? (
          <div style={{ color: "red" }}>
            Password must have between 4 to 12 characters and contain no white
            space
          </div>
        ) : (
          ""
        )}
        <input type="password" id="user-password" name="password" />
        {/* conf password */}
        <label htmlFor="conf-password" className={styles.labels}>
          Confirm Password
        </label>
        {invalid === "conf" ? (
          <div style={{ color: "red" }}>Passwords must match</div>
        ) : (
          ""
        )}
        <input type="password" id="conf-password" name="conf-password" />
        <button
          type="submit"
          disabled={mutation.isPending}
          className={styles.sumbit}
        >
          {mutation.isPending ? "Submitting..." : "Sign Up"}
        </button>
        <Link
          to={
            redirectTo
              ? `/signin?redirect=${encodeURIComponent(redirectTo)}`
              : "/signin"
          }
          style={{ color: "black" }}
        >
          Have an account?
        </Link>
      </form>
    </div>
  );
}
