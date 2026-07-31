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
import AgendaPage from './AgendaPage.jsx'
import KanbanPage from './KanbanPage.jsx'
import InicioPage from './InicioPage.jsx'
import SquadPage from './SquadPage.jsx'
import PlanosPage from './PlanosPage.jsx'
import PagamentoCartaoPage from './PagamentoCartaoPage.jsx'
import PagamentoConfirmadoPage from './PagamentoConfirmadoPage.jsx'

function Painel() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()

  return (
    <EasyMedia
      usuario={usuario}
      aoSair={() => navigate('/')}
      aoSairConta={() => { sair(); navigate('/') }}
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

function RotaAgenda() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <AgendaPage />
}

function RotaKanban() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <KanbanPage />
}

function RotaInicio() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario || usuario.tipo !== 'social_media') return <Navigate to="/" replace />
  return <InicioPage />
}

function RotaSquad() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario || usuario.tipo !== 'agencia') return <Navigate to="/" replace />
  return <SquadPage />
}

function RotaPlanos() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <PlanosPage />
}

function RotaPagamentoCartao() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <PagamentoCartaoPage />
}

function RotaPagamentoConfirmado() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/" replace />
  return <PagamentoConfirmadoPage />
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
      <Route path="/agenda" element={<RotaAgenda />} />
      <Route path="/kanban" element={<RotaKanban />} />
      <Route path="/inicio" element={<RotaInicio />} />
      <Route path="/squad" element={<RotaSquad />} />
      <Route path="/planos" element={<RotaPlanos />} />
      <Route path="/planos/cartao" element={<RotaPagamentoCartao />} />
      <Route path="/planos/confirmacao" element={<RotaPagamentoConfirmado />} />
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
