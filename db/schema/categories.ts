import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  color: text("color").notNull().default("#64748b"),
  icon: text("icon").notNull().default("tag"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});