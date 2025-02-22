import axios from "axios";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// function to ask server to validate refresh token:
const validateRefreshToken = async () => {
  try {
    const request = await axios.get(`${SERVER_URL}/validate-refresh-token`, {
      withCredentials: true,
    });
    if (request.data.status === "success") {
      return true;
    }
    // if request failed
    return false;
  } catch (error) {
    console.log(error);
    signout();
  }
};

export const validateAccessToken = async () => {
  const accessToken = localStorage.getItem("access_token");
  axios
    .post(`${SERVER_URL}/validate-access-token`, accessToken)
    .then((response) => {
      if (response.data.status === "valid") {
        return true;
      }
      return false;
    })
    .catch(() => false);
};

export const generateAccessToken = async () => {
  const validRefresh = await validateRefreshToken();
  if (validRefresh) {
    try {
      const request = await axios.get(`${SERVER_URL}/generate-access-token`, {
        withCredentials: true,
      });
      console.log(request.data.status);
      if (request.data.status === "success") {
        console.log("New access token created");
        localStorage.setItem("access_token", request.data.token);
        return true;
      }
      // if request failed
      signout();
    } catch (error) {
      console.log(error);
      signout();
    }
  }
  return false;
};

export const fetchUser = async () => {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    const user = await axios.post(`${SERVER_URL}/fetch-user`, {
      access_token,
    });
    if (user.data.user) {
      return user.data.user;
    }
  }
  // if failed fetch, refresh access token and try again:
  if (await generateAccessToken()) {
    const access_token = localStorage.getItem("access_token");
    const user = await axios.post(`${SERVER_URL}/fetch-user`, {
      access_token,
    });
    if (user.data.user) {
      return user.data.user;
    }
  }
  return false;
};

export const signout = async () => {
  localStorage.removeItem("access_token");
  const request = await axios.get(`${SERVER_URL}/signout`, {
    withCredentials: true,
  });

  if (request.data) {
    localStorage.removeItem("access_token");
    window.location.reload();
    return true;
  }
  return false;
};
