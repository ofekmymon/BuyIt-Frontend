export const shortenNames = (name, limit) => {
  if (name) {
    if (name.length > limit) {
      return name.slice(0, limit) + "...";
    }
  }
  return name;
};

export const getAvgRating = (ratings) => {
  // THIS FUNCTION WILL GET THE AVG OF ALL RATINGS
  let count = 0;
  if (ratings.length > 0) {
    ratings.forEach((review) => {
      count += review.rating;
    });
    return count / ratings.length;
  } else return 0;
};

export const functionIfEnter = (event, action) => {
  //handles the enter click to submit
  if (event.key === "Enter") {
    action(); // Trigger signin function when Enter key is pressed
  }
};

export const categoryToTitle = (category) => {
  const temp = category.replaceAll("-", " ");
  const tempList = temp.split(" ");
  for (let i = 0; i < tempList.length; i++) {
    tempList[i] = tempList[i].charAt(0).toUpperCase() + tempList[i].slice(1);
  }
  return tempList.join(" ");
};
