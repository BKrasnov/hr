import React from 'react'

import { Alert, Intent } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { TGROperationCreateBody } from 'core/models/goods-receipt/operation'

type ExistOperationWithSupNumberAlertProps = {
  isOpen: boolean
  confirmAlert: () => void
  closeAlert: () => void
  supNumber: TGROperationCreateBody['supNumber']
}

const ExistOperationWithSupNumberAlert = ({
  isOpen,
  confirmAlert,
  closeAlert,
  supNumber,
}: ExistOperationWithSupNumberAlertProps) => {
  return (
    <Alert
      isOpen={isOpen}
      icon={IconNames.WARNING_SIGN}
      intent={Intent.DANGER}
      canEscapeKeyCancel
      confirmButtonText={'Продолжить'}
      cancelButtonText={'Отмена'}
      onConfirm={confirmAlert}
      onClose={closeAlert}
    >
      <span>
        Существуют другие операции с указанным номером отгрузки поставщика:{' '}
        {supNumber}. Желаете продолжить?
      </span>
    </Alert>
  )
}

export default ExistOperationWithSupNumberAlert
