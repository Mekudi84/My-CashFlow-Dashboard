export const getBudgetSpent = (transactions, category) =>
  transactions
    .filter(({ type, category: itemCategory }) => type === "expense" && itemCategory === category)
    .reduce((total, { amount }) => total + Number(amount), 0);

export const getBudgetStatus = (limit, spent) => {
  if (spent > limit) return "over";
  if (spent >= limit * 0.8) return "warning";
  return "normal";
};
