import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./ProductPage.module.css";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getAvgRating } from "../../../hooks/useUtilities";
import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function ReviewHandler(props) {
  const [addReview, setAddReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(1);
  const [reviewed, setReviewed] = useState(false);
  const user = props.user;
  const product = props.product;
  const id = product._id;
  const queryClient = useQueryClient();

  useEffect(() => {
    function checkIfHasReview() {
      //checks if the user already reviewed this product and stores
      //  it in state. if so the add review will change to edit
      if (product && user) {
        const result = product.ratings.filter(
          (review) => user._id === review.user_id
        );
        if (result.length > 0) {
          setReviewed(true);
          setReviewText(result[0].details);
          setReviewRating(result[0].rating);
        }
      }
    }
    checkIfHasReview();
  }, [product, user]);

  //in useeffect

  const mutateReviews = useMutation({
    mutationFn: async (review) => {
      console.log(review);
      await axios.post(`${SERVER_URL}/upload-review`, review);
    },
    onSuccess: () => {
      // refresh queries so you can see your own review
      queryClient.invalidateQueries({ queryKey: [`query-product-${id}`] });
    },
    onError: (e) => {
      alert(e);
    },
  });

  function HandleStateButton() {
    //if user is logged in, display button to add or edit review.
    //  else display login link
    if (user) {
      return (
        <button
          className={styles.addReviewButton}
          onClick={() => {
            setAddReview(!addReview);
          }}
        >
          {addReview ? "Close" : reviewed ? "Edit Review" : "Add Review"}
        </button>
      );
    } else {
      const currentProductPage = window.location.pathname;
      return (
        <Link
          className={styles.addReviewButton}
          to={`/signin?redirect=${encodeURIComponent(currentProductPage)}`}
        >
          {" "}
          Cant add review sign in here
        </Link>
      );
    }
  }

  function renderReviews() {
    //renders reviews from the product
    if (product) {
      return product.ratings.map((review) => {
        return (
          <div key={review.username} className={styles.review}>
            <div> {review.username}</div>
            <p>{review.details}</p>
            <p>{review.rating}</p>
          </div>
        );
      });
    }
  }

  return (
    <div>
      <div className={styles.ratingTitle}>
        <p>Ratings:{getAvgRating(product.ratings)}/5</p>
        <p>Reviews:{product.ratings.length}</p>
      </div>
      <div className={styles.ratingDisplay}>{renderReviews()}</div>
      <div className={styles.addReviewContainer}>
        {HandleStateButton()}
        {addReview ? (
          <div className={styles.addReviewWrap}>
            <div className={styles.textAreaAndRating}>
              <textarea
                className={styles.reviewTextArea}
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                }}
              />
              <div>
                <label htmlFor="ratingSelect">
                  Rate the product (1 is lowest 5 is highest)
                </label>
                <select
                  id="ratingSelect"
                  value={reviewRating}
                  className={styles.ratingSelect}
                  onChange={(e) => {
                    setReviewRating(e.target.value);
                  }}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
            </div>
            <button
              className={styles.addReviewButton}
              onClick={() => {
                const review = {
                  username: user.name,
                  user_id: user._id,
                  product_id: id,
                  review_text: reviewText,
                  rating: reviewRating,
                };
                console.log(review);

                mutateReviews.mutate(review);
              }}
            >
              {reviewed ? "EditIt!" : "AddIt!"}
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
