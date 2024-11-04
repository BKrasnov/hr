import { createSelector } from '@reduxjs/toolkit'

import { ModuleSelector } from 'core/interfaces/utils'
import { TRootState } from 'core/store/types'
import { TStateOperationsGR } from 'core/store/types/good-receipts/operations'

import { moduleKey } from './lib/config'

function moduleSelector<T extends unknown[], R>(
  selector: ModuleSelector<TStateOperationsGR, T, R>
) {
  return (globalState: TRootState, ...args: T) =>
    selector(globalState[moduleKey], ...args)
}

const selectList = moduleSelector((state) => state.list || {})

const selectStatusRules = moduleSelector((state) => state.statusRules)

const operationByIdSelector = createSelector(
  [selectList, (_, opId: number) => opId],
  (list, opId) => list[opId] || null
)

const selectFinalRule = createSelector(selectStatusRules, (statusRules) =>
  statusRules.find((rule) => rule.final)
)

export const selectIsOperationReadOnlySelector = createSelector(
  [operationByIdSelector, selectFinalRule],
  (operation, finalRule) =>
    operation && finalRule ? operation.status === finalRule.id : false
)
