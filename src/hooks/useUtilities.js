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
