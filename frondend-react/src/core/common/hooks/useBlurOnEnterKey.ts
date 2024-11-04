import type { KeyboardEvent, MutableRefObject } from 'react'
import { useRef } from 'react'

export type UseFocusOnEnterKeyDownReturnType<T extends HTMLInputElement> =
  ReturnType<typeof useFocusOnEnterKeyDown<T>>

/** Перейти к следующему элементу при нажатии на enter. */
export const useFocusOnEnterKeyDown = <Element extends HTMLInputElement>(
  nextRef?: MutableRefObject<Element | null>
) => {
  const inputRef = useRef<Element | null>(null)

  const onKeyDownHandler = (event: KeyboardEvent<Element>) => {
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
      nextRef?.current?.focus()
    }
  }

  return {
    inputRef,
    onKeyDownHandler,
  }
}
