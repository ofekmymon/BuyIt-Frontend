import axios from "axios";

export async function saveProductHistory(user_id, category) {
  try {
    const request = await axios.get(
      "https://buyit-server.onrender.com/save-product-history",
      { params: { category: category, user_id } }
    );
    const response = await request.data;
    return response;
  } catch (e) {
    console.log(e);
  }
}

export async function saveLocalProductHistory(category) {
  const currentHistory =
    (await JSON.parse(sessionStorage.getItem("productHistory"))) || {};
  if (currentHistory[category]) {
    currentHistory[category] += 1;
  } else {
    currentHistory[category] = 1;
  }
  sessionStorage.setItem("productHistory", JSON.stringify(currentHistory));
}

export async function saveSearchHistory(user_id, searchValue) {
  try {
    const request = await axios.get(
      "https://buyit-server.onrender.com/add-search-history",
      { params: { user_id, search_query: searchValue } }
    );
    const response = await request.data;
    if (response.status === "success") return true;
    return false;
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

export async function saveLocalSearchHistory(searchValue) {
  const currentHistory =
    (await JSON.parse(sessionStorage.getItem("searchHistory"))) || {};
  if (currentHistory[searchValue]) {
    currentHistory[searchValue] += 1;
  } else {
    currentHistory[searchValue] = 1;
  }
  sessionStorage.setItem("searchHistory", JSON.stringify(currentHistory));
}

export async function getSearchHistory(user_id) {
  const request = await axios.get(
    "https://buyit-server.onrender.com/fetch-search-history",
    {
      params: { user_id },
    }
  );
  const response = await request.data;

  return await response.history;
}

export async function getProductHistory(user_id) {
  const request = await axios.get(
    "https://buyit-server.onrender.com/fetch-product-history",
    {
      params: { user_id },
    }
  );
  const response = await request.data;
  return await response.history;
}

export async function getOrderHistoryTags(user_id) {
  const request = await axios.get(
    "https://buyit-server.onrender.com/order-history-tags",
    {
      params: { user_id },
    }
  );
  const response = await request.data;
  if (response.status === "success") {
    return response.tags;
  }
  console.log(response.details || "Could not fetch data");
  return [];
}
