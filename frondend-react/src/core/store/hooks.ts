import { useDispatch, useStore } from 'react-redux'

import { ExtendedStore } from '.'
import { AppDispatch } from './types'

export const useTypedStore = useStore as () => ExtendedStore

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
