export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const createId = (prefix) => {
  const salt = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${salt}`;
};

export const sortByOption = (pets, option) => {
  const sorted = [...pets];
  if (option === "fee-low") {
    return sorted.sort((a, b) => a.fee - b.fee);
  }
  if (option === "fee-high") {
    return sorted.sort((a, b) => b.fee - a.fee);
  }
  if (option === "age-low") {
    return sorted.sort((a, b) => a.age - b.age);
  }
  if (option === "age-high") {
    return sorted.sort((a, b) => b.age - a.age);
  }
  return sorted;
};
