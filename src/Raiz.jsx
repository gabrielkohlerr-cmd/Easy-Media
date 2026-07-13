import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import EasyMedia from './App.jsx'
import PaginaLogin from './LoginPage.jsx'
import AgenciaPage from './AgenciaPage.jsx'
import ConvitePage from './ConvitePage.jsx'
import ClientePortal from './ClientePortal.jsx'
import PerfilPage from './PerfilPage.jsx'
import ClientesPage from './ClientesPage.jsx'
import CalendarioPage from './CalendarioPage.jsx'

function Painel() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()

  return (
    <EasyMedia
      usuario={usuario}
      aoSair={() => navigate('/')}
      aoSairConta={() => { sair(); navigate('/') }}
      aoAbrirAgencia={() => navigate('/agencia')}
      aoAbrirPerfil={() => navigate('/perfil')}
      aoAbrirClientes={() => navigate('/clientes')}
      aoAbrirCalendario={() => navigate('/calendario')}
    />
  )
}

function RotaAgencia() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario || usuario.tipo !== 'agencia') return <Navigate to="/" replace />
  return <AgenciaPage />
}

function RotaClientes() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario || usuario.tipo !== 'social_media') return <Navigate to="/" replace />
  return <ClientesPage />
}

function RotaPerfil() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <PerfilPage />
}

function RotaCalendario() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <CalendarioPage />
}

function Rotas() {
  const { carregando } = useAuth()
  if (carregando) return null

  return (
    <Routes>
      <Route path="/" element={<PaginaLogin />} />
      <Route path="/painel" element={<Painel />} />
      <Route path="/agencia" element={<RotaAgencia />} />
      <Route path="/clientes" element={<RotaClientes />} />
      <Route path="/perfil" element={<RotaPerfil />} />
      <Route path="/calendario" element={<RotaCalendario />} />
      <Route path="/convite/:token" element={<ConvitePage />} />
      <Route path="/cliente/:token" element={<ClientePortal />} />
    </Routes>
  )
}

export default function Raiz() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Rotas />
      </AuthProvider>
    </BrowserRouter>
  )
}
