import { pgTable, uuid, text, bigint, timestamp, date, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    period: text("period").notNull().default("monthly"),
    limitCents: bigint("limit_cents", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("USD"),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userPeriodIdx: index("budgets_user_period_idx").on(t.userId, t.startsOn),
  }),
);