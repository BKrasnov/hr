import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { GR_OPERATION_NEW } from 'core/common/routes'
import { useTypedStore } from 'core/store/hooks'

import NewOperationPage from './pages/new-operation/NewOperation'
import { operationModel } from './store'
import { moduleKey as operationsModuleKey } from './store/lib/config'

export default function Root() {
  const store = useTypedStore()
  const isInjected = React.useRef(false)

  if (!isInjected.current) {
    store.injectReducer(operationsModuleKey, operationModel.reducer)
    isInjected.current = true
  }

  return (
    <Switch>
      <Route exact path={GR_OPERATION_NEW} component={NewOperationPage} />
      <Redirect from="*" to={GR_OPERATION_NEW} />
    </Switch>
  )
}
