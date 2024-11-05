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

import { FIELD_CREATOR, FORM_CREATOR_LABEL } from '../constants'

type SelectCreatorFieldProps<T extends HTMLInputElement> = {
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function SelectCreatorField({
  enterLogic,
  form,
}: SelectCreatorFieldProps<HTMLInputElement>) {
  const handleSelectCreator = React.useCallback(
    (creator) => form.change(FIELD_CREATOR, creator),
    [form]
  )

  const mapStateToProps = (state: TRootState) => selectEmployees(state)
  const employees = useSelector(mapStateToProps, shallowEqual)

  return (
    <Field
      allowNull
      name={FIELD_CREATOR}
      render={({ input, meta }) => (
        <FormGroup
          label={FORM_CREATOR_LABEL}
          labelInfo={<HTMLForm.RequiredSymbol />}
          helperText={
            <HTMLForm.NoteOrError error={meta.touched && meta.error} />
          }
        >
          <EmployeeSelect
            value={input.value}
            disabled={meta.submitting}
            options={employees}
            onSelect={handleSelectCreator}
            isClearButtonShow={false}
            inputRef={enterLogic.inputRef}
            onKeyDownCapture={enterLogic.onKeyDownHandler}
          />
        </FormGroup>
      )}
    />
  )
}
