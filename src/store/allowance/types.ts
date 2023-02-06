export interface AllowanceItemState {
  id: number;
  name: string;
  quantity: number;
  value: number;
  unit: "h" | "d" | "m",
  withdrawable: boolean;
}

export interface AllowanceState {
  allowances: AllowanceItemState[];
}

export interface CustomAllowanceState {
  name: string;
  value: number | null;
  quantity?: number | null;
  unit: "h" | "d" | "m";
  hasDefaultValue: boolean;
}

export interface AddAllowanceItemRequest {
  allowanceId?: number;
  customItem?: CustomAllowanceState;
}

export interface UpdateAllowanceItemRequest {
  index: number;
  prop: keyof AllowanceItemState,
  value: number;
}