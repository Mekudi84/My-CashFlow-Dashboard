import { pgTable, uuid, text, bigint, timestamp, date } from "drizzle-orm/pg-core";
import { users } from "./users";

export const savingsGoals = pgTable("savings_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetCents: bigint("target_cents", { mode: "number" }).notNull(),
  currentCents: bigint("current_cents", { mode: "number" }).notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});