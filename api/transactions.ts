import { makeDispatcher } from "./_lib/dispatch";
import {
  listTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "./_lib/services/transactions";

export default makeDispatcher({
  list: listTransactions,
  get: getTransaction,
  create: createTransaction,
  update: updateTransaction,
  delete: deleteTransaction,
});