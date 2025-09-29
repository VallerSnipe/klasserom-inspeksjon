import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import DashboardPage from './pages/DashboardPage.jsx'
import ClassroomHistoryPage from './pages/ClassroomHistoryPage.jsx'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import NewInspectionPage from './pages/NewInspectionPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import InspectionDetailPage from './pages/InspectionDetailPage.jsx'
import EditInspectionPage from './pages/EditInspectionPage.jsx'
import './index.css'

function IconAcademicCap(props){
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M22 10L12 4 2 10l10 6 10-6z"/>
      <path d="M6 12v5c0 .7 2.7 2 6 2s6-1.3 6-2v-5"/>
    </svg>
  )
}
function IconHome(props){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 10v10h14V10"/>
    </svg>
  )
}
function IconPencil(props){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  )
}
function IconChartBar(props){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M3 3v18h18"/>
      <rect x="7" y="11" width="3" height="6"/>
      <rect x="12" y="7" width="3" height="10"/>
      <rect x="17" y="13" width="3" height="4"/>
    </svg>
  )
}
function IconMoon(props){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8z"/>
    </svg>
  )
}
function IconSun(props){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m18.4 6.4-1.4-1.4M7 7 5.6 5.6m12.8 0L17 7M7 17l-1.4 1.4"/>
    </svg>
  )
}

function Layout() {
  const [theme, setTheme] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem('theme') || ''
    setTheme(saved)
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark'
    setTheme(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', next)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    window.localStorage.setItem('theme', next)
  }
  return (
    <div>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundImage: 'linear-gradient(180deg, var(--header-bg), var(--header-bg-2))',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAcademicCap />
            Klasserom-inspeksjon
          </div>
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <NavLink to="/" end style={({isActive}) => ({
              color: isActive ? '#fff' : '#007bff',
              backgroundColor: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none', padding: '8px 12px', borderRadius: 6,
              border: '1px solid #007bff'
            })}><span aria-hidden><IconHome style={{ verticalAlign: 'text-bottom' }}/></span> Dashboard</NavLink>
            <NavLink to="/inspections/new" style={({isActive}) => ({
              color: isActive ? '#fff' : '#007bff',
              backgroundColor: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none', padding: '8px 12px', borderRadius: 6,
              border: '1px solid #007bff'
            })}><span aria-hidden><IconPencil style={{ verticalAlign: 'text-bottom' }}/></span> Ny inspeksjon</NavLink>
            <NavLink to="/reports" style={({isActive}) => ({
              color: isActive ? '#fff' : '#007bff',
              backgroundColor: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none', padding: '8px 12px', borderRadius: 6,
              border: '1px solid #007bff'
            })}><span aria-hidden><IconChartBar style={{ verticalAlign: 'text-bottom' }}/></span> Rapporter</NavLink>
            <button onClick={toggleTheme} title="Bytt tema" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {theme === 'dark' ? (<><IconSun/> Lys</>) : (<><IconMoon/> Mørk</>)}
            </button>
          </nav>
        </div>
      </header>
      {/* Hero stripe for extra breathing room under the header */}
      <div style={{ height: 56, background: 'var(--header-bg)' }} />
      <main style={{ padding: '16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inspections/new" element={<NewInspectionPage />} />
          <Route path="/inspections/:id" element={<InspectionDetailPage />} />
          <Route path="/inspections/:id/edit" element={<EditInspectionPage />} />
          <Route path="/classrooms/:id/history" element={<ClassroomHistoryPage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Routes>
        </div>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </React.StrictMode>,
)