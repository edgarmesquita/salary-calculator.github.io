import { createSlice, Slice, SliceCaseReducers } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AddAllowanceItemRequest, AllowanceItemState, AllowanceState, UpdateAllowanceItemRequest } from './types'
import { getAllowanceGroup, getAllowanceItem, getAllowances, getDefaultQuantityByUnit } from '@/funcs/allowance';
import { generateRandomIntegerInRange } from '@/funcs';

const baseAllowances = getAllowances();
const foodAllowanceGroup = getAllowanceGroup(2);
const foodAllowanceItem = getAllowanceItem(2);

const initialState: AllowanceState = {
  allowances: foodAllowanceItem ? [
    {
      id: foodAllowanceItem.id,
      name: foodAllowanceGroup?.name + ' - ' + foodAllowanceItem?.name,
      quantity: getDefaultQuantityByUnit(foodAllowanceGroup.unit) ?? 0,
      value: foodAllowanceItem.value ?? 0,
      unit: foodAllowanceGroup.unit,
      withdrawable: foodAllowanceGroup.withdrawable
    }
  ] : [],
}

export const allowanceSlice: Slice<AllowanceState, SliceCaseReducers<AllowanceState>, 'allowance'> = createSlice({
  name: 'allowance',
  initialState,
  reducers: {
    removeAllowanceItemByIndex: (state, action: PayloadAction<number>) => {
      state.allowances.splice(action.payload, 1);
    },
    updateAllowanceItemByIndex: (state, action: PayloadAction<UpdateAllowanceItemRequest>) => {
      let value = action.payload.value;
      if (value < 0)
        value = 0;

      state.allowances[action.payload.index][action.payload.prop] = value as never;
    },
    addAllowanceItem: (state, action: PayloadAction<AddAllowanceItemRequest>) => {
      if (action.payload.allowanceId === null || action.payload.allowanceId === undefined || action.payload.allowanceId === 0)
        return;

      let allowance: AllowanceItemState | null = null;
      if (action.payload.allowanceId === -1) {
        allowance = {
          id: generateRandomIntegerInRange(100, 99999),
          name: action.payload.customItem?.name || '',
          quantity: action.payload.customItem?.quantity || 1,
          value: action.payload.customItem?.value ?? 0,
          unit: action.payload.customItem?.unit || 'd',
          withdrawable: true
        }
      }
      else {
        const allowanceGroup = getAllowanceGroup(action.payload.allowanceId);
        const allowanceItem = getAllowanceItem(action.payload.allowanceId);
        if (!allowanceItem)
          return;

        allowance = {
          id: allowanceItem.id,
          name: allowanceGroup.name + ' - ' + allowanceItem.name,
          quantity: getDefaultQuantityByUnit(allowanceGroup.unit) ?? 0,
          value: allowanceItem.value ?? action.payload.customItem?.value ?? 0,
          unit: allowanceGroup.unit,
          withdrawable: allowanceGroup.withdrawable
        };
      }

      state.allowances.push(allowance);
    },
  },
})

// Action creators are generated for each case reducer function
export const { addAllowanceItem, updateAllowanceItemByIndex, removeAllowanceItemByIndex } = allowanceSlice.actions

export default allowanceSlice.reducer