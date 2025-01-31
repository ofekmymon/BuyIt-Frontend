import React from "react";
import styles from "./SearchBar.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { functionIfEnter } from "../../hooks/useUtilities";

export default function SearchBar({ search }) {
  const [category, setCategory] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const searchFunction = async () => {
    // this function uses the product list to search with fuse.js and sends
    // const products = await fetchAllProducts(); // gives id, name, category and tags
    if (searchValue.length > 1) {
      // navigate to page with search value and category in the url
      navigate(
        `/search-products?category=${encodeURIComponent(
          category
        )}&searchValue=${encodeURIComponent(searchValue)}`
      );
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className={styles.container}>
      <select
        id="categories"
        className={styles.categories}
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
        }}
      >
        <option value="">All</option>
        <option value="electronics">Electronics</option>
        <option value="men-clothing">Men's Clothing</option>
        <option value="women-clothing">Women's Clothing</option>
        <option value="books">Books</option>
        <option value="art">Art</option>
        <option value="video-games">Video Games</option>
        <option value="sport-and-hiking">Sports and Hiking</option>
        <option value="home-decoration">Home Decoration</option>
        <option value="hobbies">Hobbies</option>
      </select>

      <input
        type="text"
        className={styles.searchBar}
        placeholder={!error ? "Search on BuyIt" : "Enter Text Please"}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        onKeyDown={(e) => functionIfEnter(e, searchFunction)}
      />

      <button
        className={styles.searchButton}
        onClick={async () => await searchFunction()}
      ></button>
    </div>
  );
}
