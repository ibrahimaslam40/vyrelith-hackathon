import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppStateProvider } from './state/AppStateContext'
import Shell from './components/Shell'
import TabBar from './components/TabBar'
import Welcome from './routes/Welcome'
import SignIn from './routes/SignIn'
import SignUp from './routes/SignUp'
import Consent from './routes/Consent'
import Onboarding from './routes/Onboarding'
import Today from './routes/Today'
import DailyLog from './routes/DailyLog'
import Timeline from './routes/Timeline'
import InsightsCycle from './routes/InsightsCycle'
import InsightsPhotos from './routes/InsightsPhotos'
import Meds from './routes/Meds'
import Journey from './routes/Journey'
import JourneySummary from './routes/JourneySummary'
import Assistant from './routes/Assistant'
import Settings from './routes/Settings'
import KitchenSink from './routes/KitchenSink'

const PRE_AUTH_PATHS = ['/', '/signin', '/signup', '/consent', '/onboarding']
const NO_TAB_BAR_PATHS = [...PRE_AUTH_PATHS, '/kitchen-sink', '/log']

function AppRoutes() {
  const location = useLocation()
  const showTabBar = !NO_TAB_BAR_PATHS.includes(location.pathname)

  return (
    <Shell>
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/today" element={<Today />} />
          <Route path="/log" element={<DailyLog />} />
          <Route path="/insights" element={<Timeline />} />
          <Route path="/insights/cycle" element={<InsightsCycle />} />
          <Route path="/insights/photos" element={<InsightsPhotos />} />
          <Route path="/meds" element={<Meds />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/journey/summary" element={<JourneySummary />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/settings" element={<Settings />} />
          {/* Dev-only, remove before deploying per design doc §9 Phase 2 checkpoint */}
          <Route path="/kitchen-sink" element={<KitchenSink />} />
        </Routes>
      </div>
      {showTabBar && <TabBar />}
    </Shell>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppStateProvider>
  )
}
