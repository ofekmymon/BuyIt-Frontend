// Manager of the main Page's body
import React from "react";
import styles from "./MainPage.module.css";
import TopPanel from "./TopPanel";
import { useState, useEffect } from "react";
import {
  getSearchHistory,
  getProductHistory,
  getOrderHistoryTags,
} from "../../../hooks/useRec";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../../hooks/useUser";
import MiddleBody from "./MiddleBody";
import Footer from "./Footer";

const categoryList = [
  // pulls randomly from this list if no tracking data
  "electronics",
  "men-clothing",
  "women-clothing",
  "books",
  "art",
  "video-games",
  "sport-and-hiking",
  "home-decoration",
  "hobbies",
];
const wantedPanels = 6;

function randomGenerator(number, list) {
  // this function gets called if no cookie tracker gets found. gives different categories in the number of the parameter number
  let tempList = [...list];
  let result = [];
  for (let i = 0; i < number; i++) {
    const randomIndex = Math.floor(Math.random() * tempList.length);
    result.push(tempList[randomIndex]);
    tempList.splice(randomIndex, 1);
  }
  return result;
}

function categoryFiller(list) {
  // fills the list with random recommendations if not enough to create 3 top panels
  // also converts the categories with their scores (eg: [electronics , 4]) to just their category part.
  let resultList = listToString(list);

  while (resultList.length < wantedPanels) {
    const randomCategory =
      categoryList[Math.floor(Math.random() * categoryList.length)];
    if (!resultList.includes(randomCategory)) {
      resultList.push(randomCategory);
    }
  }
  return resultList;
}

function listToString(list) {
  // turns the listed categories with their visits to strings with just the category
  for (let i = 0; i < list.length; i++) {
    if (typeof list[i] === "object") {
      list[i] = list[i][0];
    }
  }
  return list;
}

function handleWhoRecommended(list) {
  // based on the storage, decide who is the recommended to make text more accurate
  const onlyCategories = list.map((item) => item[0]);
  return onlyCategories;
}

export default function MainPage() {
  const [rec, setRec] = useState([]);
  const [isRec, setIsRec] = useState([]);
  const [orderTags, setOrderTags] = useState([]);

  const {
    data: user,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user-main-page"],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const getHistoryFromServer = async () => {
      // fetches all relevent user history to use it to recommend items
      try {
        const searchHistory = Object.entries(
          (await getSearchHistory(user._id)) || {}
        );
        searchHistory.sort((a, b) => b[1] - a[1]);
        const categoryHistory = Object.entries(
          (await getProductHistory(user._id)) || {}
        );
        categoryHistory.sort((a, b) => b[1] - a[1]);
        const historyTags = await getOrderHistoryTags(user._id);
        let orderHistory = null;
        if (historyTags.length > 0) {
          // set the tags with relevency of 50 points
          orderHistory = [historyTags, 50];
          // set state as history tags to differentiate them
          setOrderTags(historyTags);
        }

        // decides if the categories are recommended or randomly from the list
        setIsRec(handleWhoRecommended(categoryHistory));
        // sort based on visited amount and relevency score (eg. products from order history are worth 50)
        // take top 2 from each history
        const temp = [
          ...categoryHistory.splice(0, 2),
          ...searchHistory.splice(0, 2),
          ...(orderHistory ? [orderHistory] : []), // add orderHistory only if exists
        ].sort((a, b) => b[1] - a[1]);
        const result = temp.length > 1 ? temp : categoryList;
        setRec(categoryFiller(result));
      } catch (e) {
        console.log(e);

        setRec(categoryList);
      }
    };
    const getHistoryFromLocal = () => {
      // pulls from session storage, if length is bigger than 1 check that
      // it is being recommended and set the categories as the recomendation
      try {
        const categoryHistory = Object.entries(
          JSON.parse(sessionStorage.getItem("productHistory")) || {}
        );
        categoryHistory.sort((a, b) => b[1] - a[1]);
        // decides if the categories are recommended or randomly from the list
        setIsRec(handleWhoRecommended(categoryHistory));
        const searchHistory = Object.entries(
          JSON.parse(sessionStorage.getItem("searchHistory")) || {}
        );
        searchHistory.sort((a, b) => b[1] - a[1]);

        // sort based on visited amount and relevency score (eg. products from search history are worth 5 points)
        const temp = [
          ...categoryHistory.splice(0, 2),
          ...searchHistory.splice(0, 2),
        ].sort((a, b) => b[1] - a[1]);
        const result = temp.length > 1 ? temp : categoryList;
        setRec(categoryFiller(result));
      } catch (e) {
        // if data or session storage failed just take category list
        console.log(e);
        setRec(categoryList);
      }
    };

    // executing part
    if (user) {
      getHistoryFromServer();
    } else if (!isLoading) {
      // if finished loading and still no user:
      getHistoryFromLocal();
    }
  }, [user, isLoading]);

  function createTopPanels() {
    // this function checks the state of the recommendations and randomly assigns them to the toppanels
    // take only the top 5 recommendations -
    // (based on score from visits or value like order history which is more valuable than a product that the user click on once)
    if (rec.length < 1) return false; // if no rec was filled already, dont load yet.
    const temp = [...rec];
    const randomList = isRec
      ? // take top 10 ranked items by relevency
        randomGenerator(wantedPanels, temp.splice(0, 10))
      : randomGenerator(wantedPanels, temp);
    console.log(randomList);

    return randomList.map((value, index) => {
      return (
        <TopPanel
          key={`${value}-${index}`}
          // decide what kind of recommendation it is
          {...(categoryList.includes(value)
            ? // decides if is recommended based on the value from useEffect
              {
                category: value,
                recommended: isRec.includes(value),
                fromOrders: false,
              }
            : orderTags === value
            ? { tags: value, recommended: true, fromOrders: true }
            : { searchValue: value, recommended: true, fromOrders: false })}
        />
      );
    });
  }

  if (isLoading || isFetching) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const middleCategories = randomGenerator(3, categoryList);
  return (
    <div id="body" className={styles.container}>
      <div className={styles.topContainer}>{createTopPanels()}</div>
      <MiddleBody category={middleCategories[0]} />
      <MiddleBody category={middleCategories[1]} />
      <MiddleBody category={middleCategories[2]} />
      <Footer />
    </div>
  );
}
