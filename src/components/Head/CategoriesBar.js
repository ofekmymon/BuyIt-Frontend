import { React, useState } from "react";
import styles from "./CategoriesBar.module.css";
import { Link } from "react-router-dom";

export default function CategoriesBar() {
  const [more, setMore] = useState(false);

  const baseCategories = [
    { name: "Electronics", value: "electronics" },
    { name: "Home Decoration", value: "home-decoration" },
    { name: "Books", value: "books" },
    { name: "Men's Clothing", value: "men-clothing" },
    { name: "Women's Clothing", value: "women-clothing" },
  ];
  const additionalCategories = [
    { name: "Sports and Hiking", value: "sport-and-hiking" },
    { name: "Art", value: "art" },
    { name: "Hobbies", value: "hobbies" },
    { name: "Video Games", value: "video-games" },
  ];

  // if user clicks more, expand categories
  const categoriesToDisplay = more
    ? [...baseCategories, ...additionalCategories]
    : baseCategories;

  return (
    <div
      id="container"
      className={`${styles.container} ${more ? styles.expanded : ""}`}
    >
      {categoriesToDisplay.map((category) => (
        <Link
          to={`/category-page/${category.value}`}
          key={category.value}
          className={styles.category}
        >
          {category.name}
        </Link>
      ))}
      <div className={styles.category} onClick={() => setMore(!more)}>
        {more ? "Show Less" : "More"}
      </div>
    </div>
  );
}
