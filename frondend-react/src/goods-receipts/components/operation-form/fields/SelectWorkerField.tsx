import React from 'react'
import { Field, FormRenderProps } from 'react-final-form'
import { shallowEqual, useSelector } from 'react-redux'

import { FormGroup } from '@blueprintjs/core'

import { UseFocusOnEnterKeyDownReturnType } from 'core/common/hooks/useBlurOnEnterKey'
import { HTMLForm } from 'core/components'
import EmployeeSelect from 'core/components/employee-select/EmployeeSelect'
import { TGROperation } from 'core/models/goods-receipt/operation'
import { selectEmployees } from 'core/store/modules/stuff'
import { TRootState } from 'core/store/types'

import { FIELD_WORKER, FORM_WORKER_LABEL } from '../constants'

type SelectWorkerFieldProps<T extends HTMLInputElement> = {
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function SelectWorkerField({
  enterLogic,
  form,
}: SelectWorkerFieldProps<HTMLInputElement>) {
  const handleSelectWorker = React.useCallback(
    (worker) => form.change(FIELD_WORKER, worker),
    [form]
  )

  const mapStateToProps = (state: TRootState) => selectEmployees(state)
  const employees = useSelector(mapStateToProps, shallowEqual)

  return (
    <Field
      allowNull
      name={FIELD_WORKER}
      render={({ input, meta }) => (
        <FormGroup
          label={FORM_WORKER_LABEL}
          labelInfo={<HTMLForm.RequiredSymbol />}
          helperText={
            <HTMLForm.NoteOrError error={meta.touched && meta.error} />
          }
        >
          <EmployeeSelect
            value={input.value}
            disabled={meta.submitting}
            options={employees}
            onSelect={handleSelectWorker}
            isClearButtonShow={false}
            inputRef={enterLogic.inputRef}
            onKeyDownCapture={enterLogic.onKeyDownHandler}
          />
        </FormGroup>
      )}
    />
  )
}
