import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import GlobalToast from './components/GlobalToast'
import LoginPage from './page/LoginPage'
import NotFoundPage from './page/NotFoundPage'
import RegisterPage from './page/RegisterPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <GlobalToast />
    </BrowserRouter>
  )
}

export default App