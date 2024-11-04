/* eslint-disable */
import { replace } from 'connected-react-router'
import { difference as _difference, reduce as _reduce } from 'lodash-es'

import grAPI from 'core/api/goods-receipts'
import { GR_OPERATION, toPath } from 'core/common/routes'
import {
  TGROperation,
  TGROperationCreateBody,
} from 'core/models/goods-receipt/operation'
import { TStateOperationsGR } from 'core/store/types/good-receipts/operations'
import { reducerPrefix } from './lib/config'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'


export const initialState: TStateOperationsGR = {
  list: {},
  byIds: [],
  total: 0,
  creating: false,
  statusRules: [],
}

/** Создать операцию. */
export const createAsync = createAsyncThunk<TGROperation, TGROperationCreateBody>(`${reducerPrefix}/CREATE_OPERATION`, async (operationCreateBody, { dispatch }) =>{
  const operation = await grAPI.createOperation(operationCreateBody);
  dispatch(replace(toPath(GR_OPERATION, { opId: operation.id })))
  return operation;
})

const slice = createSlice({
  name: reducerPrefix,
  initialState,
  reducers: {},
  extraReducers: ({ addCase }) => {
      addCase(createAsync.pending, (state) => {
        state.creating = true;
      })
      addCase(createAsync.fulfilled, (state, action: PayloadAction<TGROperation>) => {
        const operation = action.payload;
        state.creating = false;
        state.byIds = [operation.id, ...state.byIds];
        state.list[operation.id] = operation;
        state.total += 1; 
      })
      addCase(createAsync.rejected, (state) => {
        state.creating = false;
      });
  },
});

export const { reducer } = slice;