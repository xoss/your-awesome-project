import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App