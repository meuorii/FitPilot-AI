import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GlobalToast from './components/GlobalToast'
import LoginPage from './page/LoginPage'
import RegisterPage from './page/RegisterPage'
import OnboardingPage from './page/OnboardingPage'
import { DashboardPage } from './page/DashboardPage'
import { WorkoutsPage } from './page/WorkoutsPage'
import { MealsPage } from './page/MealsPage'
import { CoachPage } from './page/CoachPage'
import { ProgressPage } from './page/ProgressPage'
import { SettingsPage } from './page/SettingsPage'
import NotFoundPage from './page/NotFoundPage'
import { RequireAuth } from './auth/RequireAuth'
import { MainDashboardLayout } from './layouts/MainDashboardLayout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<RequireAuth><MainDashboardLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <GlobalToast />
    </BrowserRouter>
  )
}

export default App