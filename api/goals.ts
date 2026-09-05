import { makeDispatcher } from "./_lib/dispatch";
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "./_lib/services/goals";

export default makeDispatcher({
  list: listGoals,
  create: createGoal,
  update: updateGoal,
  delete: deleteGoal,
});