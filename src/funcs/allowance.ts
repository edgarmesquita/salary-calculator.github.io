import allowances from "@/data/allowances.json";
import { Allowance, AllowanceItem } from "@/models/allowance";

export const getAllowances = () => {
  return allowances as Allowance[];
}
export const getAllowanceGroup = (id: number) => {
  return allowances.find(o => o.items.findIndex(i => i.id === id) >= 0) as Allowance;
}

export const getAllowanceItem = (id: number) : AllowanceItem | undefined => {
  return allowances.map(o => o.items as AllowanceItem[]).reduce((a, b) => a.concat(b)).find(o => o.id === id);
}

export const getUnitDescription = (unit?: "h" | "d" | "m") => {
  switch (unit) {
    case "h":
      return "Hours";
    case "d":
      return "Days";
    case "m":
      return "Months";
  }
  return null;
}

export const getDefaultQuantityByUnit = (unit: 'h' | 'd' | 'm') => {
  switch (unit) {
    case 'h': return 8;
    case 'd': return 22;
    case 'm': return 1;
    default: return null;
  }
}