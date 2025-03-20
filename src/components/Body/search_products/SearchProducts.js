import React from "react";
import styles from "./SearchProducts.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { shortenNames } from "../../../hooks/useUtilities";
import { useInView } from "react-intersection-observer";
import {
  saveLocalSearchHistory,
  saveSearchHistory,
} from "../../../hooks/useRec";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function SearchProducts() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const searchValue = searchParams.get("searchValue") || ""; // get the search parameters from the searchbar
  const [sortOption, setSortOption] = useState("relevence");
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]);
  const per_page = 6; // the limit per query

  const {
    data: productList,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["infinite-products", category, searchValue, sortOption],
    queryFn: ({ pageParam }) =>
      fetchQueriedProducts({
        pageParam,
        category,
        sortOption,
        searchValue,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.nextPage ?? undefined;
    },
    refetchOnWindowFocus: false,
  });

  const fetchQueriedProducts = async ({
    pageParam = 1,
    category,
    sortOption,
    searchValue,
  }) => {
    const request = await axios.get(`${SERVER_URL}/products/products-query`, {
      params: {
        category,
        page: pageParam,
        sort_by: sortOption,
        search: searchValue,
        per_page,
      },
    });
    return await request.data;
  };

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage]);

  useEffect(() => {
    const sendSearchHistory = async () => {
      if (user) {
        saveSearchHistory(user._id, searchValue);
      } else {
        saveLocalSearchHistory(searchValue);
      }
    };
    if (productList?.pages?.[0]?.length >= 4) {
      sendSearchHistory();
    }
  }, [productList?.pages?.[0], user, searchValue]); // eslint-disable-line

  return (
    <div className={styles.container}>
      <div className={styles.title}>Showing Results For: "{searchValue}"</div>
      <div className={styles.title}>
        {productList?.pages?.[0].length || 0} Results found
      </div>
      <div className={styles.sortOptions}>
        <label htmlFor={"sortSelect"}>Sort By:</label>
        <select
          id="sortSelect"
          className={styles.selectBy}
          onChange={(e) => {
            setSortOption(e.target.value);
          }}
          value={sortOption}
        >
          <option value={"relevence"}>Relevence</option>
          <option value={"low-to-high"}>Low To High Price</option>
          <option value={"high-to-low"}>High To Low Price</option>
          <option value={"ratings"}>High Ratings</option>
        </select>
      </div>
      {/* Load based on state */}
      {error ? (
        <div className={styles.stateMessage}>Error Loading Products</div>
      ) : isLoading ? (
        <div className={styles.stateMessage}>Loading...</div>
      ) : (
        <div className={styles.productContainer}>
          {productList?.pages?.map((group, index) => (
            <React.Fragment key={index}>
              {group.products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </React.Fragment>
          ))}
          {isFetching && (
            <div className={styles.stateMessage}>Loading more...</div>
          )}
          {!hasNextPage && (
            <div className={`${styles.stateMessage} ${styles.noMoreProducts}`}>
              No More Products Found.
            </div>
          )}
          <div ref={ref}></div>
        </div>
      )}
    </div>
  );
}

const Product = ({ product }) => {
  const navigate = useNavigate();

  if (product) {
    return (
      <div className={styles.product}>
        <img
          src={product.images[0]}
          alt="Data Not Found"
          className={styles.productImage}
          onClick={() => {
            navigate(`/item-page/${product._id}`);
          }}
        ></img>
        <div className={styles.productDetails}>
          <div
            className={`${styles.productDetail} ${styles.productName}`}
            onClick={() => {
              navigate(`/item-page/${product._id}`);
            }}
          >
            {shortenNames(product.name, 60)}
          </div>
          <div className={`${styles.productDetail} ${styles.productPrice}`}>
            {product.price}$
          </div>
          <div className={styles.productDetail}>
            {product.average_rating || 0}/5 Reviews: {product.ratings.length}
          </div>
          <div className={`${styles.productDetail} ${styles.productSeller}`}>
            {/* TODO ADD SELLER LINK HERE */}
            {product.seller}
          </div>
        </div>
      </div>
    );
  }
};
