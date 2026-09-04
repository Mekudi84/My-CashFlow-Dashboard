export const getIncome = (transactions) =>
  transactions.filter(({ type }) => type === "income")
    .reduce((total, { amount }) => total + Number(amount), 0);

export const getExpenses = (transactions) =>
  transactions.filter(({ type }) => type === "expense")
    .reduce((total, { amount }) => total + Number(amount), 0);

export const getBalance = (transactions) => getIncome(transactions) - getExpenses(transactions);

export const getSavingsRate = (transactions) => {
  const income = getIncome(transactions);
  const expenses = getExpenses(transactions);
  return income ? ((income - expenses) / income) * 100 : 0;
};

export const getCategoryExpenses = (transactions, category) =>
  transactions
    .filter(({ type, category: itemCategory }) => type === "expense" && itemCategory === category)
    .reduce((total, { amount }) => total + Number(amount), 0);

export const sortTransactions = (transactions, sortBy) => {
  const copy = [...transactions];
  switch (sortBy) {
    case "oldest":
      return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    case "high":
      return copy.sort((a, b) => Number(b.amount) - Number(a.amount));
    case "low":
      return copy.sort((a, b) => Number(a.amount) - Number(a.amount));
    default:
      return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

export const filterTransactions = (transactions, search, type, category) =>
  transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = type === "all" || transaction.type === type;
    const matchesCategory = category === "all" || transaction.category === category;
    return matchesSearch && matchesType && matchesCategory;
  });

export const findTransaction = (transactions, id) =>
  transactions.find((transaction) => transaction.id === id);
