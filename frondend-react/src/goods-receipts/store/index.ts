import { selectIsOperationReadOnlySelector } from './selectors'
import { createAsync, reducer } from './slice'

export const operationModel = {
  reducer,
  thunks: {
    createAsync,
  },
  selectors: {
    selectIsOperationReadOnlySelector,
  },
}
