import React from 'react'
import { FormRenderProps } from 'react-final-form'

import { UseFocusOnEnterKeyDownReturnType } from 'core/common/hooks/useBlurOnEnterKey'
import {
  MixedAgreementsField,
  MixedAgreementsSelectField,
} from 'core/components/form-fields'
import { MixedAgreement } from 'core/models/agreement'
import { ContractorTypes } from 'core/models/contractor'
import { TGROperation } from 'core/models/goods-receipt/operation'
import { GR_STATUS_NEW } from 'core/models/goods-receipt/statuses'

import {
  FIELD_MIXED_AGREEMENT,
  FIELD_REPAYMENT_PERIOD,
  FIELD_REPAYMENT_PERIOD_TAKE_FROM_AGREEMENT,
  FORM_AGREEMENT_LABEL,
  FORM_SUPPLIER_LABEL,
  INVALID_CONTRACOR,
} from '../constants'

type MixedAgreementsFieldContainerProps<T extends HTMLInputElement> = {
  isNew: boolean
  operation: TGROperation
  isLoadingMixedAgreement: boolean
  mixedAgreements: MixedAgreement[]
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function MixedAgreementsFieldContainer({
  isNew,
  operation,
  isLoadingMixedAgreement,
  form,
  mixedAgreements,
  enterLogic,
}: MixedAgreementsFieldContainerProps<HTMLInputElement>) {
  const { values } = form.getState()

  const handleChangeMixedAgreement = (agreement: MixedAgreement | null) => {
    if (values[FIELD_REPAYMENT_PERIOD_TAKE_FROM_AGREEMENT] === true) {
      form.change(FIELD_REPAYMENT_PERIOD, agreement?.repaymentPeriod)
    }
  }

  return (
    <>
      {isNew ? (
        <MixedAgreementsField
          name={FIELD_MIXED_AGREEMENT}
          label={FORM_SUPPLIER_LABEL}
          required
          inputProps={{
            isClearButtonShow: false,
            autoFocus: true,
            contractorType: ContractorTypes.SUPPLIER,
            loadImmediately: true,
            minQueryLength: 0,
            inputRef: enterLogic.inputRef,
            onKeyDown: enterLogic.onKeyDownHandler,
          }}
          onChange={handleChangeMixedAgreement}
        />
      ) : (
        <MixedAgreementsSelectField
          name={FIELD_MIXED_AGREEMENT}
          label={FORM_AGREEMENT_LABEL}
          required
          contractorId={operation.supplier.id ?? INVALID_CONTRACOR}
          disabled={operation.status !== GR_STATUS_NEW}
          contractorType={ContractorTypes.SUPPLIER}
          inputProps={{
            isClearButtonShow: false,
            loading: isLoadingMixedAgreement,
          }}
          // @ts-ignore
          elementRef={
            operation.status !== GR_STATUS_NEW ? null : enterLogic.inputRef
          }
          options={mixedAgreements}
          onChange={handleChangeMixedAgreement}
        />
      )}
    </>
  )
}
