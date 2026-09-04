import { makeDispatcher } from "./_lib/dispatch";
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from "./_lib/services/accounts";

export default makeDispatcher({
  list: listAccounts,
  get: getAccount,
  create: createAccount,
  update: updateAccount,
  delete: deleteAccount,
});