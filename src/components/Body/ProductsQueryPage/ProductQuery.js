import React, { useEffect, useState, useRef } from "react";
import styles from "./ProductQuery.module.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { shortenNames } from "../../../hooks/useUtilities";
import { useInView } from "react-intersection-observer";
import {
  saveProductHistory,
  saveLocalProductHistory,
} from "../../../hooks/useRec";

export default function ProductQuery() {
  const [sortOption, setSortOption] = useState("");
  const { category } = useParams();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]);
  const fetchProducts = async ({ pageParam = 1, category, sortOption }) => {
    const request = await axios.get(
      `https://buyit-server.onrender.com/products-query`,
      {
        params: { category, page: pageParam, sort_by: sortOption },
      }
    );
    return await request.data;
  };

  useEffect(() => {
    // reset the sort option when category changes
    setSortOption("");
  }, [category]);

  useEffect(() => {
    const product_to_history = async () => {
      // if user is logged, save the history in the db,
      //  otherwise save it in session storage incase of guest
      if (user && category) {
        saveProductHistory(user._id, category);
      } else if (category) {
        // save to local storage. the category of the item and the amount visited
        saveLocalProductHistory(category);
      }
    };
    product_to_history();
  }, [category, user]);

  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["infinite-products", category, sortOption],
      queryFn: ({ pageParam }) =>
        fetchProducts({ pageParam, category, sortOption }),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.nextPage ?? undefined;
      },
      refetchOnWindowFocus: false,
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage]);

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.sortOptions}>
        <select
          className={styles.selectBy}
          onChange={(e) => {
            setSortOption(e.target.value);
          }}
          value={sortOption}
        >
          <option value={""}>Sort By</option>
          <option value={"low-to-high"}>Low To High Price</option>
          <option value={"high-to-low"}>High To Low Price</option>
          <option value={"ratings"}>High Ratings</option>
        </select>
      </div>
      <div className={styles.productsContainer}>
        {data?.pages?.map((group, index) => (
          <React.Fragment key={index}>
            {group.products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </React.Fragment>
        ))}
      </div>
      {isFetching && <div className={styles.isLoading}>Loading more...</div>}
      <div ref={ref}></div>
    </div>
  );
}

const Product = ({ product }) => {
  // the component for product

  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef(null);

  const transitionImage = () => {
    // function to transition the images on hover
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentImage((prevImg) => (prevImg + 1) % product.images.length);
      }, 1000);
    }
  };

  const stopTransition = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setCurrentImage(0); // Reset to first image
  };

  if (product) {
    return (
      <div className={styles.product}>
        <img
          className={styles.productImage}
          src={product.images[currentImage]}
          alt="Data not found"
          onClick={() => {
            navigate(`/item-page/${product._id}`);
          }}
          onMouseOver={transitionImage}
          onMouseLeave={stopTransition}
        ></img>
        <div className={styles.productDetails}>
          <div className={`${styles.productText} ${styles.productName}`}>
            {shortenNames(product.name, 50)}
          </div>
          <div className={styles.productPrice}>{product.price}$</div>
          <div className={styles.productText}>
            {product.average_rating || 0}/5 Reviews: {product.ratings.length}
          </div>
          <div className={styles.productSeller}>By {product.seller}</div>
        </div>
      </div>
    );
  }
};
