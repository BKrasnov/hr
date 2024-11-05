import React from 'react'
import { Field, FormRenderProps, FormSpy } from 'react-final-form'

import {
  Button,
  Classes,
  ControlGroup,
  FormGroup,
  InputGroup,
  Intent,
} from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { getFormFieldId } from 'core/common/forms'
import { UseFocusOnEnterKeyDownReturnType } from 'core/common/hooks/useBlurOnEnterKey'
import { CopyNumberButton, HTMLForm } from 'core/components'
import { TGROperation } from 'core/models/goods-receipt/operation'

import {
  FIELD_MANUAL_NUMBER,
  FIELD_NUMBER,
  FORM_NUMBER_LABEL,
  FORM_NUMBER_NOTE_AUTO,
  FORM_NUMBER_NOTE_MANUAL,
} from '../constants'

type NumberFieldProps<T extends HTMLInputElement> = {
  isNew: boolean
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function NumberField({
  isNew,
  form,
  enterLogic: { inputRef, onKeyDownHandler },
}: NumberFieldProps<HTMLInputElement>) {
  return (
    <FormSpy
      subscription={{ values: true }}
      render={({ values }) => (
        <Field
          name={FIELD_NUMBER}
          render={({ input, meta }) => (
            <FormGroup
              label={FORM_NUMBER_LABEL}
              labelInfo={<HTMLForm.RequiredSymbol />}
              helperText={
                <HTMLForm.NoteOrError
                  note={
                    isNew && values.manualNumber
                      ? FORM_NUMBER_NOTE_MANUAL
                      : FORM_NUMBER_NOTE_AUTO
                  }
                  error={meta.touched && meta.error}
                />
              }
            >
              <ControlGroup>
                <InputGroup
                  disabled={meta.submitting || (isNew && !values.manualNumber)}
                  name={FIELD_NUMBER}
                  id={getFormFieldId(FIELD_NUMBER)}
                  value={input.value}
                  onChange={input.onChange}
                  autoFocus={!isNew}
                  className={Classes.FILL}
                  inputRef={inputRef}
                  onKeyDown={onKeyDownHandler}
                  rightElement={
                    isNew ? (
                      <Tooltip2
                        content={
                          values.manualNumber
                            ? 'генерировать автоматически'
                            : 'ввести вручную'
                        }
                      >
                        <Button
                          minimal
                          intent={Intent.PRIMARY}
                          onClick={() =>
                            form.change(
                              FIELD_MANUAL_NUMBER,
                              !values.manualNumber
                            )
                          }
                          icon={values.manualNumber ? 'unlock' : 'lock'}
                        />
                      </Tooltip2>
                    ) : undefined
                  }
                />
                {!isNew && (
                  <CopyNumberButton
                    number={input.value}
                    small={false}
                    minimal={false}
                  />
                )}
              </ControlGroup>
            </FormGroup>
          )}
        />
      )}
    />
  )
}
