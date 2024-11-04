import { MixedAgreement, TAgreement } from '../agreement'

export type Supplier = {
  id: number
}

export type Creator = {
  id: number
  name: string
}

export type Worker = {
  id: number
  name: string
}

/** Номер отгрузки поставщика. */
export type SupNumber = string

export type TGROperation = {
  id: number
  agreementId: TAgreement['id']
  agreement: TAgreement | null
  number: string
  worker: Worker
  creator: Creator
  createDate: string
  buyPriceAmount: number
  buyPriceAmountHV: string
  supBuyPriceAmount: number
  supBuyPriceAmountHV: string
  buyAmountHV: string
  supBuyAmountHV: string
  supNumber?: SupNumber
  supShipmentDate: null | string
  supplier: Supplier
  status: number
  sumSOQuantity: number
  sumQuantity: number
  positionsCount: number
  repaymentPeriod: number | null
  debt: number
  debtHV: string
  manualNumber: boolean
  repaymentPeriodTakeFromAgreement: boolean
  mixedAgreement: MixedAgreement | null
}

export type TGROperationCreateBody = {
  agreementId: number
  createDate: string
  creatorId: Creator['id']
  supNumber: SupNumber
  supShipmentDate: string
  supplierId: Supplier['id']
  workerId: Worker['id']
  number?: string
}

export type TGROperationUpdateBody = {
  agreementId: number
  createDate: string
  creatorId: Creator['id']
  id: number
  number: string
  supNumber?: SupNumber
  supShipmentDate?: string
  supplierId: Supplier['id']
  workerId: Worker['id']
  repaymentPeriod?: number | null
  repaymentPeriodTakeFromAgreement?: boolean
}

export type TGROperationsListRO = {
  list: TGROperation[]
  total: number
}
