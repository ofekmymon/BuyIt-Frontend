// Top panels, filled with different categories
import React from "react";
import styles from "./TopPanel.module.css";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { shortenNames, categoryToTitle } from "../../../hooks/useUtilities";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function TopPanel(props) {
  const navigate = useNavigate();
  const category = props?.category;
  const searchValue = props?.searchValue;
  const tags = props?.tags;
  const isRec = props.recommended;
  const isOrderHistory = props.fromOrders;

  async function queryItems() {
    const request = await axios.get(
      `${SERVER_URL}/products/query-products-by-category`,
      { params: { category, number: 4 } }
    );
    return await request.data.result;
  }

  async function queryBySearch() {
    // search by searchvalue if no category
    const request = await axios.get(`${SERVER_URL}/products/products-query`, {
      params: { search: searchValue, per_page: 4, rnd: true },
    });
    const response = await request.data;
    return await response.products;
  }

  async function queryByTags() {
    // search by the order history tags
    const request = await axios.post(
      `${SERVER_URL}/products/search-products-with-tags`,
      { tags: tags }
    );
    const response = await request.data;
    if (response.status === "success") {
      return await response.products;
    } else {
      console.log(response.details);
    }
  }

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: [`getProductsTop${category}-${searchValue}-${tags}`],
    queryFn: category ? queryItems : searchValue ? queryBySearch : queryByTags,
    refetchOnWindowFocus: false,
  });

  if (isError) {
    return <div className={styles.container}>Error loading products</div>;
  }

  if (isFetching || isLoading) {
    return <div className={styles.container}>Loading</div>;
  }

  const handleTitle = () => {
    return (
      <div className={styles.title}>
        {isRec && isOrderHistory ? (
          <div className={styles.title}>Based on your past orders</div>
        ) : isRec && searchValue ? (
          <div className={styles.title}>Based on your search history</div>
        ) : isRec && !searchValue ? (
          <Link className={styles.title} to={`/category-page/${category}`}>
            {categoryToTitle(category)} you might like
          </Link>
        ) : (
          <Link className={styles.title} to={`/category-page/${category}`}>
            {categoryToTitle(category)}
          </Link>
        )}
      </div>
    );
  };

  // global timeout variable
  let pictureChangeTimeout;

  return (
    <div className={styles.container}>
      {handleTitle()}
      <div className={styles.productContainer}>
        {data
          ? data.map((product) => (
              <div className={styles.product} key={product.name}>
                <img
                  className={styles.productImage}
                  src={product.images[0]}
                  alt="No Product Found"
                  key={product._id}
                  //handle product click
                  onClick={() => {
                    navigate(`/item-page/${product._id}`);
                  }}
                  //handle image transition
                  onMouseOver={(e) => {
                    if (product.images[1]) {
                      e.target.classList.add(styles.transitioning);
                      pictureChangeTimeout = setTimeout(() => {
                        e.target.classList.remove(styles.transitioning);
                        e.target.src = product.images[1];
                      }, 400);
                    }
                  }}
                  onMouseLeave={(e) => {
                    clearTimeout(pictureChangeTimeout);
                    e.target.classList.remove(styles.transitioning);
                    e.target.src = product.images[0];
                  }}
                  //
                ></img>
                <div className={styles.productName}>
                  {shortenNames(product.name, 20)}
                </div>
              </div>
            ))
          : "Error: could not load data"}
      </div>
    </div>
  );
}
