import { useStore } from 'react-redux'

import { ExtendedStore } from '.'

export const useTypedStore = useStore as () => ExtendedStore
