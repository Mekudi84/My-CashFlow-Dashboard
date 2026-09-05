import { makeDispatcher } from "./_lib/dispatch";
import {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "./_lib/services/budgets";

export default makeDispatcher({
  list: listBudgets,
  create: createBudget,
  update: updateBudget,
  delete: deleteBudget,
});