// Fills the middle part of the main page. has sliders to change the items
import React, { useState } from "react";
import styles from "./MiddleBody.module.css";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { shortenNames, categoryToTitle } from "../../../hooks/useUtilities";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
export default function MiddleBody(props) {
  const [currentIndex, setIndex] = useState(0);
  const visibleCount = 7;

  const navigate = useNavigate();

  function handlePrev() {
    setIndex((prev) => Math.max(prev - 1, 0)); // left slide, wont go below 0
  }
  function handleNext() {
    if (data) {
      setIndex(
        (prev) => Math.min(prev + 1, data.length - visibleCount) // right slide, stops at the end
      );
    }
  }

  async function queryItems() {
    const category = props.category;
    const request = await axios.get(
      `${SERVER_URL}/query-products-by-category`,
      { params: { category, number: 11 } }
    );
    return await request.data.result;
  }
  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: [`getProductsMiddle${props.category}`],
    queryFn: queryItems,
    refetchOnWindowFocus: false,
    enabled: !!props.category,
  });

  return (
    <div className={styles.slidingContainer}>
      <Link style={{ color: "black" }} to={`/category-page/${props.category}`}>
        <h3 className={styles.title}>{categoryToTitle(props.category)}</h3>
      </Link>
      <button
        onClick={handlePrev}
        className={`${styles.slidingBtn} ${styles.noMobile}`}
        disabled={currentIndex === 0}
      >
        <FaArrowLeft />
      </button>
      <div className={styles.containerWrapper}>
        <div
          className={styles.container}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {isLoading || isFetching ? (
            <div>Loading..</div>
          ) : isError ? (
            <div>Error Loading Items</div>
          ) : data ? (
            data.map((product) => {
              return (
                <div className={styles.panel} key={product._id}>
                  <img
                    className={styles.panelImage}
                    src={product.images[0]}
                    alt=""
                    onClick={() => {
                      navigate(`/item-page/${product._id}`);
                    }}
                  ></img>
                  <div className={styles.panelName}>
                    {shortenNames(product.name, 45)}
                  </div>
                </div>
              );
            })
          ) : (
            "Error: could not load data"
          )}
        </div>
      </div>
      <button
        onClick={handleNext}
        className={`${styles.slidingBtn} ${styles.noMobile}`}
        disabled={data ? currentIndex >= data.length - visibleCount : true}
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
