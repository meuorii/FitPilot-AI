import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import GlobalToast from './components/GlobalToast'
import LoginPage from './page/LoginPage'
import NotFoundPage from './page/NotFoundPage'
import RegisterPage from './page/RegisterPage'
import OnboardingPage from './page/OnboardingPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <GlobalToast />
    </BrowserRouter>
  )
}

export default App