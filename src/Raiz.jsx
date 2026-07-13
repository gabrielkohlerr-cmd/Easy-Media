import { useState } from 'react'
import EasyMedia from './App.jsx'
import PaginaLogin from './LoginPage.jsx'

export default function Raiz() {
  const [tela, setTela] = useState('login')

  return tela === 'login'
    ? <PaginaLogin aoVerDemo={() => setTela('painel')} />
    : <EasyMedia aoSair={() => setTela('login')} />
}
