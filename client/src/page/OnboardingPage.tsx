import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { calculateGoals, completeOnboarding } from '../services/api/onboarding'
import AboutYouStep, { type AboutYouFormData } from '../components/Onboarding/AboutYou'
import GoalStep from '../components/Onboarding/GoalStep'
import OnboardingSidebar from '../components/Onboarding/OnboardingSidebar'
import PlanStep from '../components/Onboarding/PlanStep'
import WelcomeStep from '../components/Onboarding/WelcomeStep'
import { useToastStore } from '../stores/toastStore'
import type { CalculateGoalsRequest, CompleteOnboardingRequest, GoalOption, Profile } from '../services/types/onboarding'

interface OnboardingPageProps { token?: string }
type OnboardingStep = 1 | 2 | 3 | 4

const initialFormData: AboutYouFormData = { age: '', gender: '', height_cm: '', weight_kg: '', activity_level: '' }

function readSessionToken(providedToken?: string) {
  if (providedToken) return providedToken
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token') ?? window.localStorage.getItem('accessToken') ?? window.localStorage.getItem('access_token') ?? window.localStorage.getItem('authToken')
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function createGoalsPayload(formData: AboutYouFormData): CalculateGoalsRequest | null {
  const age = Number(formData.age), height = Number(formData.height_cm), weight = Number(formData.weight_kg)
  if (!formData.gender || !formData.activity_level || !Number.isFinite(age) || age < 13 || age > 100 || !Number.isFinite(height) || height < 100 || height > 250 || !Number.isFinite(weight) || weight < 30 || weight > 350) return null
  return { age, gender: formData.gender, height_cm: height, weight_kg: weight, activity_level: formData.activity_level }
}

export default function OnboardingPage({ token }: OnboardingPageProps) {
  const navigate = useNavigate()
  const showToast = useToastStore((state) => state.showToast)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState<AboutYouFormData>(initialFormData)
  const [goals, setGoals] = useState<GoalOption[]>([])
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateFormField = <K extends keyof AboutYouFormData>(field: K, value: AboutYouFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  const goBack = () => {
    if (isLoading) return
    setError(null)
    setCurrentStep((step) => Math.max(1, step - 1) as OnboardingStep)
  }

  const notifyError = (heading: string, message: string) => {
    showToast({ type: 'error', heading, subheading: message, position: 'top-right', duration: 5000, showCloseButton: true, showProgress: true })
  }

  const submitAboutYou = async () => {
    const payload = createGoalsPayload(formData)
    if (!payload) {
      const message = 'Review your profile details and select an activity level before continuing.'
      setError(message); notifyError('A few details need attention', message); return
    }
    const sessionToken = readSessionToken(token)
    if (!sessionToken) {
      const message = 'Your session token is missing. Please sign in again before continuing.'
      setError(message); notifyError('Session required', message); return
    }
    setIsLoading(true); setError(null)
    try {
      const response = await calculateGoals(payload, sessionToken)
      const recommended = response.data.find((goal) => goal.is_recommended) ?? response.data[0] ?? null
      if (response.data.length === 0) throw new Error('No goal options were returned. Please try again.')
      setGoals(response.data); setSelectedGoal(recommended); setProfile(null); setCurrentStep(3)
    } catch (requestError) {
      const message = toErrorMessage(requestError, 'We could not calculate your goals. Please try again.')
      setError(message); notifyError('Couldn’t calculate your goals', message)
    } finally { setIsLoading(false) }
  }

  const submitSelectedGoal = async () => {
    if (!selectedGoal) {
      const message = 'Choose a goal before continuing.'
      setError(message); notifyError('Select your main goal', message); return
    }
    const profilePayload = createGoalsPayload(formData)
    if (!profilePayload) {
      const message = 'Your profile details are incomplete. Go back and review Step 2.'
      setError(message); notifyError('Profile details missing', message); return
    }
    const sessionToken = readSessionToken(token)
    if (!sessionToken) {
      const message = 'Your session token is missing. Please sign in again before continuing.'
      setError(message); notifyError('Session required', message); return
    }
    const payload: CompleteOnboardingRequest = { age: profilePayload.age, gender: profilePayload.gender, height_cm: profilePayload.height_cm, current_weight_kg: profilePayload.weight_kg, target_weight_kg: selectedGoal.recommended_target_weight_kg, activity_level: profilePayload.activity_level, primary_goal: selectedGoal.goal, is_onboarded: true }
    setIsLoading(true); setError(null)
    try {
      const response = await completeOnboarding(payload, sessionToken)
      setProfile(response.data); setCurrentStep(4)
      showToast({ type: 'success', heading: 'Your FitPilot plan is ready', subheading: 'Rocco built your starting targets from your completed profile.', position: 'top-right', duration: 4500, showCloseButton: true, showProgress: true })
    } catch (requestError) {
      const message = toErrorMessage(requestError, 'We could not save your onboarding profile. Please try again.')
      setError(message); notifyError('Couldn’t finish onboarding', message)
    } finally { setIsLoading(false) }
  }

  const finishOnboarding = () => { navigate('/dashboard', { replace: true }) }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#F5F3F6] font-sans text-[#38323F] lg:grid lg:grid-cols-[350px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
      <OnboardingSidebar currentStep={currentStep} />
      <main className="min-w-0">
        {currentStep === 1 && <WelcomeStep onContinue={() => setCurrentStep(2)} />}
        {currentStep === 2 && <AboutYouStep formData={formData} isLoading={isLoading} error={error} onChange={updateFormField} onBack={goBack} onContinue={submitAboutYou} />}
        {currentStep === 3 && <GoalStep goals={goals} selectedGoal={selectedGoal} isLoading={isLoading} error={error} onSelect={(goal) => { setSelectedGoal(goal); setError(null) }} onBack={goBack} onContinue={submitSelectedGoal} />}
        {currentStep === 4 && profile && <PlanStep profile={profile} onBack={goBack} onFinish={finishOnboarding} />}
      </main>
    </div>
  )
}