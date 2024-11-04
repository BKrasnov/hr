import * as React from 'react'
import { shallowEqual, useSelector } from 'react-redux'

import { Card } from '@blueprintjs/core'

import { push } from 'connected-react-router'
import {
  DEFAULT_CREATE_NEW_TYPE,
  getLinkAfterSuccessCreation,
  GR_CREATE_NEW_OP_TYPE_LOCAL_STORAGE_KEY,
  isCreateNewOpType,
} from 'goods-receipts/components/operation-form/common'
import OperationForm from 'goods-receipts/components/operation-form/OperationForm'
import { operationModel } from 'goods-receipts/store'
import moment from 'moment'

import { isNotCancelRequest } from 'core/common/api'
import logger from 'core/common/logger'
import appStorage from 'core/common/storage'
import {
  AppToaster,
  ContentLayout,
  PageHead,
  PageHeader,
  PageLayout,
} from 'core/components'
import {
  TGROperation,
  TGROperationCreateBody,
} from 'core/models/goods-receipt/operation'
import { useAppDispatch } from 'core/store/hooks'
import { selectCurrentEmployeeId } from 'core/store/modules/common'
import { selectEmployeeById } from 'core/store/modules/stuff'
import { TRootState } from 'core/store/types'
import LayoutStyles from 'core/styles/layout.module.scss'

import NewOperationBreadcrumbs from './NewOperationBreadcrumbs'

export default function NewOperationPage() {
  const dispatch = useAppDispatch()

  const mapState = (state: TRootState) =>
    selectEmployeeById(state, selectCurrentEmployeeId(state))
  const currentEmployee = useSelector(mapState, shallowEqual)

  const operationDraft: Partial<TGROperation> = {
    manualNumber: false,
    worker: currentEmployee,
    creator: currentEmployee,
    createDate: moment().toISOString(),
    repaymentPeriod: null,
  }

  const handleCreateOperation = async (formData: TGROperationCreateBody) => {
    try {
      const result = await dispatch(
        operationModel.thunks.createAsync(formData)
      ).unwrap()

      AppToaster.success({
        message: 'Операция успешно создана',
      })

      const savedOption =
        appStorage.getItem(GR_CREATE_NEW_OP_TYPE_LOCAL_STORAGE_KEY) ||
        DEFAULT_CREATE_NEW_TYPE

      if (!isCreateNewOpType(savedOption)) return

      const newPositionUrl = getLinkAfterSuccessCreation(
        savedOption,
        result.id.toString()
      )

      dispatch(push(newPositionUrl))
    } catch (e) {
      if (isNotCancelRequest(e)) {
        logger.error(e)
        throw e
      }
    }
  }

  return (
    <PageLayout>
      <ContentLayout>
        <PageHeader>
          <PageHead>
            <NewOperationBreadcrumbs />
          </PageHead>
        </PageHeader>
        <Card elevation={1} className={LayoutStyles.MainCard}>
          <OperationForm
            operation={operationDraft}
            onSubmit={handleCreateOperation}
          />
        </Card>
      </ContentLayout>
    </PageLayout>
  )
}
