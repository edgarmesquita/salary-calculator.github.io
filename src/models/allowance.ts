export interface Allowance {
  name: string;
  isExempt: boolean;
  withdrawable: boolean;
  unit: "h" | "d" | "m";
  items: AllowanceItem[];
}

export interface AllowanceItem {
  id: number;
  name: string;
  value?: number | null;
}