export type Note = JSX.Element | string

export type DirtyFieldsMap = Record<string, boolean>

export type TFieldProps = {
  name: string
  label?: string
  note?: Note
  disabled?: boolean
  required?: boolean
  allowNull?: boolean
  className?: string
  contentClassName?: string
  placeholder?: string
}
