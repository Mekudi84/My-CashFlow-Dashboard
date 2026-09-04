import { makeDispatcher } from "./_lib/dispatch";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./_lib/services/categories";

export default makeDispatcher({
  list: listCategories,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
});