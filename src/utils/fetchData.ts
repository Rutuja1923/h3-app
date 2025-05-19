//some async operation
export const fetchSomeData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: "Sample data" });
    }, 100);
  });
};
