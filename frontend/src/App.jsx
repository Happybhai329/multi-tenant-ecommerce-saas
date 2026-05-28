import { Provider } from 'react-redux'
import store from './app/store'
import { ToastProvider } from './components/ToastContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </Provider>
  )
}

export default App
