import * as React from 'react'
import { useEffect, useRef } from 'react'
import { Field, Form, FormRenderProps, FormSpy } from 'react-final-form'

import { Button, FormGroup, Intent } from '@blueprintjs/core'
import { DateInput, TimePrecision } from '@blueprintjs/datetime'
import { IconNames } from '@blueprintjs/icons'

import { FORM_ERROR, FormApi } from 'final-form'
import createDecorator from 'final-form-focus'
import { isDate } from 'lodash-es'
import moment from 'moment'

import ContractorsApi from 'core/api/contractors'
import grAPI from 'core/api/goods-receipts'
import { localeUtils } from 'core/common/date'
import { useFocusOnEnterKeyDown } from 'core/common/hooks/useBlurOnEnterKey'
import logger from 'core/common/logger'
import { ErrorAlert, HTMLForm } from 'core/components'
import { WhenFieldChanges } from 'core/components/form/Form'
import { DirtyFieldsMap } from 'core/interfaces/forms'
import { MixedAgreement } from 'core/models/agreement'
import {
  TGROperation,
  TGROperationCreateBody,
} from 'core/models/goods-receipt/operation'
import {
  getInitialValues,
  normalize,
  validate,
} from 'core/validation/operations.gr'

import {
  FIELD_MANUAL_NUMBER,
  FIELD_NUMBER,
  FIELD_SUP_SHIPMENT_DATE,
  FORM_SUPPLIER_DATE_LABEL,
} from './constants'
import { CreateOperationButton } from './CreateOperationButton'
import ExistOperationWithSupNumberAlert from './ExistOperationWithSupNumberAlert'
import { CreateDateField } from './fields/CreateDateField'
import { MixedAgreementsFieldContainer } from './fields/MixedAgreementsFieldContainer'
import { NumberField } from './fields/NumberField'
import { SelectCreatorField } from './fields/SelectCreatorField'
import { SelectWorkerField } from './fields/SelectWorkerField'
import { SupplierShipmentNumberField } from './fields/SupplierShipmentNumberField'

interface IOperationFormRendererProps extends FormRenderProps<TGROperation> {
  isLoadingMixedAgreement: boolean
  isNew: boolean
  mixedAgreements: MixedAgreement[]
  operation: TGROperation
}

function OperationFormRenderer({
  isNew,
  operation,
  form,
  isLoadingMixedAgreement,
  handleSubmit,
  mixedAgreements,
}: IOperationFormRendererProps) {
  const maxDate = new Date()

  const timerRef = useRef<number | null>(null)

  const creatorEnterLogic = useFocusOnEnterKeyDown<HTMLInputElement>()
  const workerEnterLogic = useFocusOnEnterKeyDown<HTMLInputElement>(
    creatorEnterLogic.inputRef
  )
  const createDateLogic = useFocusOnEnterKeyDown<HTMLInputElement>(
    workerEnterLogic.inputRef
  )
  const mixedAgreementsLogic = useFocusOnEnterKeyDown<HTMLInputElement>(
    createDateLogic.inputRef
  )
  const numberEnterLogic = useFocusOnEnterKeyDown<HTMLInputElement>(
    mixedAgreementsLogic.inputRef
  )

  const supShipmentDateRef = useRef<HTMLInputElement | null>(null)

  const supplierShipmentNumberEnterLogic =
    useFocusOnEnterKeyDown<HTMLInputElement>(supShipmentDateRef)
  const submitButtonRef = useRef<HTMLInputElement | null>(null)

  const handleChangeSupShipmentDate = React.useCallback(
    (date) =>
      form.change(
        FIELD_SUP_SHIPMENT_DATE,
        isDate(date) ? moment(date).toISOString() : null
      ),
    [form]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <HTMLForm onSubmit={handleSubmit} fill>
      <NumberField isNew={isNew} enterLogic={numberEnterLogic} form={form} />
      <WhenFieldChanges
        field={FIELD_MANUAL_NUMBER}
        becomes={false}
        set={FIELD_NUMBER}
        to=""
      />
      <MixedAgreementsFieldContainer
        isNew={isNew}
        operation={operation}
        isLoadingMixedAgreement={isLoadingMixedAgreement}
        mixedAgreements={mixedAgreements}
        form={form}
        enterLogic={mixedAgreementsLogic}
      />
      <CreateDateField form={form} enterLogic={createDateLogic} />
      <SelectWorkerField form={form} enterLogic={workerEnterLogic} />
      <SelectCreatorField form={form} enterLogic={creatorEnterLogic} />
      <SupplierShipmentNumberField
        form={form}
        enterLogic={supplierShipmentNumberEnterLogic}
      />

      <Field
        name={FIELD_SUP_SHIPMENT_DATE}
        allowNull
        render={({ input, meta }) => (
          <FormGroup
            label={FORM_SUPPLIER_DATE_LABEL}
            helperText={
              <HTMLForm.NoteOrError
                error={meta.touched && meta.error}
              />
            }
          >
            <DateInput
              disabled={meta.submitting}
              showActionsBar
              todayButtonText={'Сегодня'}
              clearButtonText={'Очистить'}
              maxDate={maxDate}
              onChange={handleChangeSupShipmentDate}
              inputProps={{
                name: input.name,
                rightElement: input.value && (
                  <Button
                    onClick={() => {
                      form.change(input.name as keyof TGROperation, null)
                    }}
                    icon={IconNames.CROSS}
                    minimal
                  />
                ),
                inputRef: supShipmentDateRef,
              }}
              timePrecision={TimePrecision.MINUTE}
              // timePickerProps={{ fill: true }}
              value={input.value ? moment(input.value).toDate() : null}
              formatDate={(date) => moment(date).format('DD.MM.YYYY HH:mm')}
              parseDate={(date) => moment(date, 'DD.MM.YYYY HH:mm').toDate()}
              popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
              dayPickerProps={{ localeUtils }}
            />
          </FormGroup>
        )}
      />

      <FormSpy
        subscription={{
          values: true,
          pristine: true,
          submitting: true,
          submitError: true,
        }}
        render={({ pristine, submitting, submitError }) => (
          <>
            {submitError && (
              <ErrorAlert
                error={submitError}
                text={'Произошла ошибка при сохранении операции'}
              />
            )}
            <HTMLForm.Buttons>
              {isNew ? (
                <CreateOperationButton
                  loading={submitting}
                  disabled={submitting || (!isNew && pristine)}
                  // @ts-ignore
                  elementRef={submitButtonRef}
                  onSubmit={form.submit}
                />
              ) : (
                <Button
                  intent={Intent.PRIMARY}
                  type="submit"
                  loading={submitting}
                  disabled={submitting || (!isNew && pristine)}
                  text={'Сохранить'}
                  // @ts-ignore
                  elementRef={submitButtonRef}
                />
              )}
            </HTMLForm.Buttons>
          </>
        )}
      />
    </HTMLForm>
  )
}

const focusOnErrors = createDecorator()

interface IOperationFormProps {
  operation: Partial<TGROperation>
  onSubmit: (formData: TGROperationCreateBody) => Promise<void>
}

type CheckOperationForExistSupNumberFuncType = (
  supNumber: TGROperationCreateBody['supNumber'],
  values: Partial<TGROperation>,
  dirtyFields: DirtyFieldsMap
) => Promise<void>

export default function OperationForm({
  operation,
  onSubmit,
}: IOperationFormProps) {
  // изначальные значения поля поставщик + договор
  const [mixedAgreement, setMixedAgreement] =
    React.useState<MixedAgreement | null>(null)

  // отформатированные значения формы
  const initialValues = React.useMemo(
    () => getInitialValues({ ...operation }),
    [operation, mixedAgreement]
  )

  // значения опций для поля постащик
  const [mixedAgreements, setMixedAgreements] = React.useState<
    MixedAgreement[]
  >([])

  // флаг видимости алерта для подтвержения сохранения формы при совпадении номера отгрузки
  const [isVisibleAlert, setIsVisibleAlert] = React.useState(false)

  // Нормализованные значения формы необходимые для вывода внутри Alert
  const [normalizedFormValues, setNormalizedFormValues] =
    React.useState<TGROperationCreateBody>()

  // флаг создания новой сущности
  const isNew = React.useMemo(
    () => initialValues.id === undefined,
    [initialValues]
  )

  const [isLoading, setLoading] = React.useState(false)

  const { agreement, supplier } = operation

  const fetchInitialMixedAgreement = async () => {
    try {
      setLoading(true)

      const { data } = await ContractorsApi.getMixedAgreements()

      const results = Array.isArray(data) ? data : []

      const _mixedAgreement = results.find((item) => {
        return (
          item.agreementId === agreement?.id &&
          item.contractorId === supplier?.id
        )
      })

      setMixedAgreements(results)
      setMixedAgreement(_mixedAgreement || null)
    } catch (error) {
      logger.error(error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!isNew) {
      fetchInitialMixedAgreement()
    }
  }, [isNew])

  // Фк-ция подтвержения сохранения формы при совпадении номера отгрузки с другими операциями приёмки
  const confirmAlert = React.useCallback(async () => {
    if (!normalizedFormValues) return
    await onSubmit(normalizedFormValues)
  }, [onSubmit, normalizedFormValues])

  // Фк-ция закрытия алерта
  const closeAlert = () => {
    setIsVisibleAlert(false)
  }

  // Ф-кция проверяет номер отгрузки поставщика на совпадения с другими операциями приёмки
  // если есть совпадение, показывает Alert об этом
  const checkOperationForExistSupNumber =
    React.useCallback<CheckOperationForExistSupNumberFuncType>(
      async (supNumber, values, dirtyFields) => {
        const operationsResponse = await grAPI.getOperationsList({ supNumber })
        if (
          operationsResponse.total &&
          operationsResponse.list.some((op) => op.id !== operation?.id)
        ) {
          setNormalizedFormValues(normalize(values, dirtyFields))
          setIsVisibleAlert(true)
        } else {
          await onSubmit(normalize(values, dirtyFields))
        }
      },
      [onSubmit, operation]
    )

  // функция сохранения формы
  const handleSubmit = React.useCallback(
    async (values: Partial<TGROperation>, form: FormApi) => {
      const { dirtyFields } = form.getState()
      try {
        // если введен номер отгрузки поставщика, и он не совпадает с текущим  номером отгрузки,
        // делаем запрос в API для поиска уже существующих операций с таким номером отгрузки
        if (values.supNumber && values.supNumber !== operation.supNumber) {
          await checkOperationForExistSupNumber(
            values.supNumber ?? '',
            values,
            dirtyFields
          )
        } else {
          await onSubmit(normalize(values, dirtyFields))

          if (values.mixedAgreement && dirtyFields.mixedAgreement) {
            setMixedAgreement(values.mixedAgreement)
          }
        }
      } catch (e) {
        return { [FORM_ERROR]: e }
      }
    },
    [operation, onSubmit, checkOperationForExistSupNumber]
  )

  return (
    <>
      {/* Alert для подтвержения сохранения формы при совпадении номера отгрузки с другими операциями приёмки */}
      {isVisibleAlert && (
        <ExistOperationWithSupNumberAlert
          isOpen={isVisibleAlert}
          confirmAlert={confirmAlert}
          closeAlert={closeAlert}
          supNumber={normalizedFormValues?.supNumber ?? ''}
        />
      )}
      <Form
        isNew={isNew}
        decorators={[focusOnErrors]}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        // @ts-ignore
        component={OperationFormRenderer}
        validate={validate}
        operation={operation}
        isLoadingMixedAgreement={isLoading}
        mixedAgreements={mixedAgreements}
      />
    </>
  )
}
