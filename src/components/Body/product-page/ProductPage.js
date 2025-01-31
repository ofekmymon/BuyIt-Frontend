import React from "react";
import styles from "./ProductPage.module.css";
import MiddleBody from "../mainpage/MiddleBody";
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReviewHandler from "./ReviewHandler";
import AddToCart from "./AddToCart";
import {
  saveLocalProductHistory,
  saveProductHistory,
} from "../../../hooks/useRec";

import axios from "axios";

export default function ProductPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const location = useLocation();
  const reviewsRef = useRef(null);
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]);

  // get product id from the url params
  const { id } = useParams();
  async function fetchProductData() {
    const request = await axios.get(
      "https://buyit-server.onrender.com/fetch-product",
      {
        params: { id },
      }
    );
    return await request.data.product;
  }

  const {
    data: product,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [`query-product-${id}`],
    queryFn: fetchProductData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (product && location.hash === "#reviews" && reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location, product]);

  useEffect(() => {
    const product_to_history = async () => {
      // if user is logged, save the history in the db,
      //  otherwise save it in session storage incase of guest
      if (user && product) {
        saveProductHistory(user._id, product.category);
      } else if (product) {
        // save to local storage. the category of the item and the amount visited
        saveLocalProductHistory(product.category);
      }
    };
    product_to_history();
  }, [id, user, product]);

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  function displayImageChangers() {
    return product.images.map((image, index) => {
      return (
        <div
          key={index}
          className={styles.imageChanger}
          onClick={() => {
            setCurrentImage(index);
          }}
        ></div>
      );
    });
  }

  return (
    <div className={styles.container}>
      {isError ? (
        <div>Error Product Not Found</div>
      ) : (
        <div className={styles.productWrapper}>
          <div className={styles.productDetails}>
            <div className={styles.imageContainer}>
              {/* img changes based on the img state */}
              <img
                className={styles.imageWrap}
                src={product.images[currentImage]}
                key={product.images[currentImage]}
                alt=""
              />
              <div className={styles.imageButtonContainer}>
                {/* Map that based on the amount of images has buttons to switch images */}
                {displayImageChangers()}
              </div>
            </div>
            <div className={styles.details}>
              <h3 className={styles.name}>{product.name}</h3>
              <div className={styles.productDetail}>
                About: <br />
                {product.details}
              </div>
              <div className={styles.price}>Price: {product.price}$</div>
            </div>

            <AddToCart product={product} user={user || null} />
          </div>
          <div
            id={"reviews"}
            ref={reviewsRef}
            className={styles.ratingsContainer}
          >
            {<ReviewHandler user={user} product={product} />}
          </div>
          <div className={styles.recommendations}>
            {product && product.category ? (
              <MiddleBody category={product.category} />
            ) : (
              ""
            )}
          </div>
        </div>
      )}
    </div>
  );
}
