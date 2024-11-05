import React from 'react'
import { FormRenderProps } from 'react-final-form'

import {
  IOperationFormRendererProps,
  OperationFormRenderer,
} from './OperationForm'

export const OperationFormWrapper: React.FC<
  FormRenderProps & IOperationFormRendererProps
> = ({
  isNew,
  operation,
  isLoadingMixedAgreement,
  mixedAgreements,
  ...formProps
}) => {
  return (
    <OperationFormRenderer
      isNew={isNew}
      operation={operation}
      isLoadingMixedAgreement={isLoadingMixedAgreement}
      mixedAgreements={mixedAgreements}
      {...formProps}
    />
  )
}
