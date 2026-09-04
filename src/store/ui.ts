import { create } from "zustand";
import type { DateRangeKey } from "@/types";

export type TxTypeFilter = "all" | "income" | "expense";
export type TxStatusFilter = "all" | "pending" | "completed";

interface UiState {
  query: string;
  dateRange: DateRangeKey;
  filterType: TxTypeFilter;
  filterCategory: string | "all";
  filterStatus: TxStatusFilter;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  showAddModal: boolean;
  showDrawerId: string | null;
  loading: boolean;
  setQuery: (q: string) => void;
  setDateRange: (r: DateRangeKey) => void;
  setFilterType: (t: TxTypeFilter) => void;
  setFilterCategory: (id: string | "all") => void;
  setFilterStatus: (s: TxStatusFilter) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  setLoading: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  query: "",
  dateRange: "6M",
  filterType: "all",
  filterCategory: "all",
  filterStatus: "all",
  sidebarCollapsed: false,
  mobileNavOpen: false,
  showAddModal: false,
  showDrawerId: null,
  loading: true,
  setQuery: (q) => set({ query: q }),
  setDateRange: (r) => set({ dateRange: r }),
  setFilterType: (t) => set({ filterType: t }),
  setFilterCategory: (id) => set({ filterCategory: id }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  resetFilters: () =>
    set({
      query: "",
      filterType: "all",
      filterCategory: "all",
      filterStatus: "all",
    }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),
  openDrawer: (id) => set({ showDrawerId: id }),
  closeDrawer: () => set({ showDrawerId: null }),
  setLoading: (v) => set({ loading: v }),
}));