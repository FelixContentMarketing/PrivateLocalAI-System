import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { EinstellungenPage } from './pages/EinstellungenPage'
import { BenutzerPage } from './pages/BenutzerPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/benutzer" element={<BenutzerPage />} />
            <Route path="/einstellungen" element={<EinstellungenPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
