import { TAgreement } from '../agreement'

export type Supplier = {
  id?: number;
}

export type TGROperation = {
  id: number
  agreementId: number
  agreement: TAgreement | null
  number: string
  worker: unknown
  creator: unknown
  createDate: string
  buyPriceAmount: number
  buyPriceAmountHV: string
  supBuyPriceAmount: number
  supBuyPriceAmountHV: string
  buyAmountHV: string
  supBuyAmountHV: string
  supNumber: null | string
  supShipmentDate: null | string
  supplier: Supplier
  status: number
  sumSOQuantity: number
  sumQuantity: number
  positionsCount: number
  repaymentPeriod: number | null
  debt: number
  debtHV: string
  manualNumber: number;
}

export type TGROperationCreateBody = {
  agreementId: number
  createDate: string
  creatorId: number
  supNumber: string
  supShipmentDate: string
  supplierId: number
  workerId: number
  number?: string
}

export type TGROperationUpdateBody = {
  agreementId: number
  createDate: string
  creatorId: number
  id: number
  number: string
  supNumber?: string
  supShipmentDate?: string
  supplierId: number
  workerId: number
  repaymentPeriod?: number | null
  repaymentPeriodTakeFromAgreement?: boolean
}

export type TGROperationsListRO = {
  list: TGROperation[]
  total: number
}
