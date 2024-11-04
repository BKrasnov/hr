import * as React from 'react'
import { useEffect, useRef } from 'react'
import { Field, Form, FormRenderProps, FormSpy } from 'react-final-form'
import { shallowEqual, useSelector } from 'react-redux'

import {
  Button,
  FormGroup,
  Intent,
} from '@blueprintjs/core'
import { DateInput, TimePrecision } from '@blueprintjs/datetime'
import { IconNames } from '@blueprintjs/icons'

import { FORM_ERROR, FormApi } from 'final-form'
import createDecorator from 'final-form-focus'
import {
  isDate, 
} from 'lodash-es'
import moment from 'moment'

import ContractorsApi from 'core/api/contractors'
import grAPI from 'core/api/goods-receipts'
import { localeUtils } from 'core/common/date'
import { useFocusOnEnterKeyDown } from 'core/common/hooks/useBlurOnEnterKey'
import logger from 'core/common/logger'
import {
  EmployeeSelect,
  ErrorAlert,
  HTMLForm,
} from 'core/components'
import {
  MixedAgreementsField,
  MixedAgreementsSelectField,
} from 'core/components/form-fields'
import { WhenFieldChanges } from 'core/components/form/Form'
import { DirtyFieldsMap } from 'core/interfaces/forms'
import { MixedAgreement } from 'core/models/agreement'
import { ContractorTypes } from 'core/models/contractor'
import {
  TGROperation,
  TGROperationCreateBody,
} from 'core/models/goods-receipt/operation'
import { GR_STATUS_NEW } from 'core/models/goods-receipt/statuses'
import { selectEmployees } from 'core/store/modules/stuff'
import { TRootState } from 'core/store/types'
import {
  getInitialValues,
  normalize,
  validate,
} from 'core/validation/operations.gr'

import {
  FIELD_CREATE_DATE,
  FIELD_CREATOR,
  FIELD_MANUAL_NUMBER,
  FIELD_MIXED_AGREEMENT,
  FIELD_NUMBER,
  FIELD_REPAYMENT_PERIOD,
  FIELD_REPAYMENT_PERIOD_TAKE_FROM_AGREEMENT,
  FIELD_SUP_SHIPMENT_DATE,
  FIELD_WORKER,
  FORM_AGREEMENT_LABEL,
  FORM_CREATE_DATE_LABEL,
  FORM_CREATOR_LABEL,
  FORM_SUPPLIER_DATE_LABEL,
  FORM_SUPPLIER_LABEL,
  FORM_WORKER_LABEL,
  INVALID_CONTRACOR,
} from './constants'
import { CreateOperationButton } from './CreateOperationButton'
import ExistOperationWithSupNumberAlert from './ExistOperationWithSupNumberAlert'
import { NumberField } from './fields/NumberField'
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
  const maxDate = React.useMemo(() => new Date(), [])

  const timerRef = useRef<number | null>(null)

  const mixedAgreementsRef = useRef<HTMLInputElement | null>(null)
  const numberEnterLogic =
    useFocusOnEnterKeyDown<HTMLInputElement>(mixedAgreementsRef)

  const workerRef = useRef<HTMLInputElement | null>(null)
  const workerInputRef = useRef<HTMLInputElement | null>(null)
  const creatorRef = useRef<HTMLInputElement | null>(null)
  const creatorInputRef = useRef<HTMLInputElement | null>(null)
  const createDateRef = useRef<HTMLInputElement | null>(null)
  const supShipmentDateRef = useRef<HTMLInputElement | null>(null)
  const supplierShipmentNumberEnterLogic =
    useFocusOnEnterKeyDown<HTMLInputElement>(supShipmentDateRef)
  const submitButtonRef = useRef<HTMLInputElement | null>(null)

  const { values } = form.getState()

  const mapStateToProps = (state: TRootState) => ({
    employees: selectEmployees(state),
  })

  const { employees } = useSelector(mapStateToProps, shallowEqual)

  const handleSelectCreator = React.useCallback(
    (creator) => form.change(FIELD_CREATOR, creator),
    [form]
  )
  const handleSelectWorker = React.useCallback(
    (worker) => form.change(FIELD_WORKER, worker),
    [form]
  )

  const handleChangeCreateDate = React.useCallback(
    (date) =>
      form.change(
        FIELD_CREATE_DATE,
        isDate(date) ? moment(date).toISOString() : undefined
      ),
    [form]
  )
  const handleChangeSupShipmentDate = React.useCallback(
    (date) =>
      form.change(
        FIELD_SUP_SHIPMENT_DATE,
        isDate(date) ? moment(date).toISOString() : null
      ),
    [form]
  )

  const handleChangeMixedAgreement = (agreement: MixedAgreement | null) => {
    if (values[FIELD_REPAYMENT_PERIOD_TAKE_FROM_AGREEMENT] === true) {
      form.change(FIELD_REPAYMENT_PERIOD, agreement?.repaymentPeriod)
    }
  }

  const dateInputRef = useRef<DateInput>(null)

  const handleDateBlur = () => {
    if (dateInputRef.current) {
      dateInputRef.current.setState({
        isOpen: false,
      })
    }
  }

  // /**  */
  // const handleOnEnter = (e: KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault()
  //     console.log(e.target)
  //     if (e.target === numberRef.current) {
  //       if (mixedAgreementsRef.current !== null) {
  //         mixedAgreementsRef.current.focus()
  //       } else {
  //         // @ts-ignore
  //         createDateRef.current.focus()
  //       }
  //     }

  //     if (e.target === mixedAgreementsRef.current) {
  //       // @ts-ignore
  //       timerRef.current = setTimeout(() => createDateRef.current.focus(), 500)
  //     }

  //     if (e.target === createDateRef.current) {
  //       // @ts-ignore
  //       timerRef.current = setTimeout(() => workerRef.current.focus(), 200)
  //     }

  //     if (e.target === workerInputRef.current) {
  //       // @ts-ignore
  //       timerRef.current = setTimeout(() => creatorRef.current.focus(), 200)
  //     }

  //     if (e.target === creatorInputRef.current) {
  //       // @ts-ignore
  //       timerRef.current = setTimeout(() => supNumberRef.current.focus(), 200)
  //     }

  //     if (e.target === supNumberRef.current) {
  //       // @ts-ignore
  //       supShipmentDateRef.current.focus()
  //     }

  //     if (e.target === supShipmentDateRef.current) {
  //       // @ts-ignore
  //       submitButtonRef.current.focus()
  //     }
  //   }
  // }

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
            inputRef: mixedAgreementsRef,
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
            operation.status !== GR_STATUS_NEW ? null : mixedAgreementsRef
          }
          options={mixedAgreements}
          onChange={handleChangeMixedAgreement}
        />
      )}

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
                inputRef: createDateRef,
                onBlur: handleDateBlur,
              }}
              timePrecision={TimePrecision.MINUTE}
              // @ts-ignore
              timePickerProps={{ fill: true }}
              value={input.value ? moment(input.value).toDate() : null}
              formatDate={(date) => moment(date).format('DD.MM.YYYY HH:mm')}
              parseDate={(date) => moment(date, 'DD.MM.YYYY HH:mm').toDate()}
              popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
              ref={dateInputRef}
              // @ts-ignore
              dayPickerProps={{ localeUtils }}
            />
          </FormGroup>
        )}
      />
      <Field
        allowNull
        name={FIELD_WORKER}
        render={({ input, meta }) => (
          <FormGroup
            label={FORM_WORKER_LABEL}
            labelInfo={<HTMLForm.RequiredSymbol />}
            helperText={
              <HTMLForm.NoteOrError
                error={meta.touched && meta.error}
              />
            }
          >
            <EmployeeSelect
              value={input.value}
              disabled={meta.submitting}
              options={employees}
              onSelect={handleSelectWorker}
              isClearButtonShow={false}
              inputRef={workerInputRef}
              // @ts-ignore
              buttonRef={workerRef}
            />
          </FormGroup>
        )}
      />
      <Field
        allowNull
        name={FIELD_CREATOR}
        render={({ input, meta }) => (
          <FormGroup
            label={FORM_CREATOR_LABEL}
            labelInfo={<HTMLForm.RequiredSymbol />}
            helperText={
              <HTMLForm.NoteOrError
                // @ts-ignore
                error={meta.touched && meta.error}
              />
            }
          >
            <EmployeeSelect
              value={input.value}
              disabled={meta.submitting}
              options={employees}
              onSelect={handleSelectCreator}
              isClearButtonShow={false}
              inputRef={creatorInputRef}
              // @ts-ignore
              buttonRef={creatorRef}
            />
          </FormGroup>
        )}
      />
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
                // @ts-ignore
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
                      console.log(
                        '496 form.change(input.name, null)',
                        input.name
                      )
                      // @ts-ignore
                      form.change(input.name, null)
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
