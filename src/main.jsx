import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './AppRouter.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import DataProvider from './DataProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </Provider>
  </StrictMode>
)
