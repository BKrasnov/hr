import React, { useRef } from 'react'
import { Field, FormRenderProps } from 'react-final-form'

import { FormGroup } from '@blueprintjs/core'
import { DateInput, TimePrecision } from '@blueprintjs/datetime'

import { isDate } from 'lodash-es'
import moment from 'moment'

import { localeUtils } from 'core/common/date'
import { UseFocusOnEnterKeyDownReturnType } from 'core/common/hooks/useBlurOnEnterKey'
import { HTMLForm } from 'core/components'
import { TGROperation } from 'core/models/goods-receipt/operation'

import { FIELD_CREATE_DATE, FORM_CREATE_DATE_LABEL } from '../constants'

type CreateDateFieldProps<T extends HTMLInputElement> = {
  enterLogic: UseFocusOnEnterKeyDownReturnType<T>
} & Pick<FormRenderProps<TGROperation>, 'form'>

export function CreateDateField({
  form,
  enterLogic,
}: CreateDateFieldProps<HTMLInputElement>) {
  const maxDate = new Date()

  const handleChangeCreateDate = React.useCallback(
    (date) =>
      form.change(
        FIELD_CREATE_DATE,
        isDate(date) ? moment(date).toISOString() : undefined
      ),
    [form]
  )

  const dateInputRef = useRef<DateInput>(null)

  const handleDateBlur = () => {
    console.log('handleDateBlur')
    if (dateInputRef.current) {
      dateInputRef.current.setState({
        isOpen: false,
      })
    }
  }

  return (
    <Field
      name={FIELD_CREATE_DATE}
      allowNull
      render={({ input, meta }) => (
        <FormGroup
          label={FORM_CREATE_DATE_LABEL}
          labelInfo={<HTMLForm.RequiredSymbol />}
          helperText={
            <HTMLForm.NoteOrError error={meta.touched && meta.error} />
          }
        >
          <DateInput
            disabled={meta.submitting}
            showActionsBar
            todayButtonText={'Сегодня'}
            clearButtonText={'Очистить'}
            maxDate={maxDate}
            onChange={handleChangeCreateDate}
            inputProps={{
              name: input.name,
              inputRef: enterLogic.inputRef,
              onBlur: handleDateBlur,
              onKeyDown: enterLogic.onKeyDownHandler,
            }}
            timePrecision={TimePrecision.MINUTE}
            // @ts-ignore
            timePickerProps={{ fill: true }}
            value={input.value ? moment(input.value).toDate() : null}
            formatDate={(date) => moment(date).format('DD.MM.YYYY HH:mm')}
            parseDate={(date) => moment(date, 'DD.MM.YYYY HH:mm').toDate()}
            popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
            ref={dateInputRef}
            dayPickerProps={{ localeUtils }}
          />
        </FormGroup>
      )}
    />
  )
}
