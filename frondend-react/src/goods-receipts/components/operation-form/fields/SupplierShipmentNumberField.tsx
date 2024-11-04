import React from 'react'
import { Field, FormRenderProps } from 'react-final-form'

import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import { UseFocusOnEnterKeyDownReturnType } from 'core/common/hooks/useBlurOnEnterKey'
import { HTMLForm } from 'core/components'
import { TGROperation } from 'core/models/goods-receipt/operation'

import { FIELD_SUP_NUMBER } from '../constants'

type SupplierShipmentNumberFieldProps<T extends HTMLInputElement> = {
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function SupplierShipmentNumberField({
  form,
  enterLogic: { inputRef, onKeyDownHandler },
}: SupplierShipmentNumberFieldProps<HTMLInputElement>) {
  return (
    <Field
      name={FIELD_SUP_NUMBER}
      render={({ input, meta }) => (
        <FormGroup
          label="Номер отгрузки поставщика"
          helperText={
            <HTMLForm.NoteOrError error={meta.touched && meta.error} />
          }
        >
          <InputGroup
            type="text"
            onChange={(e) => form.change(FIELD_SUP_NUMBER, e.target.value)}
            value={input.value || ''}
            disabled={meta.submitting}
            onKeyDown={onKeyDownHandler}
            inputRef={inputRef}
            rightElement={
              input.value && (
                <Button
                  onClick={() => {
                    console.log(
                      '457: form.change(input.name, null)',
                      input.name
                    )
                    // @ts-ignore
                    form.change(input.name, null)
                  }}
                  icon={IconNames.CROSS}
                  minimal
                />
              )
            }
          />
        </FormGroup>
      )}
    />
  )
}
