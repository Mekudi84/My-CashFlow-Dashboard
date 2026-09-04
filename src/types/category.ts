export type CategoryKind = "income" | "expense";

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  kind: CategoryKind;
  color: string;
  icon: string;
}