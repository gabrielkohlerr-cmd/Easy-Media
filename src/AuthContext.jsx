import React, { createContext, useContext, useEffect, useState } from "react";
import { api, obterToken, salvarToken, limparToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!obterToken()) { setCarregando(false); return; }
    api.eu()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => limparToken())
      .finally(() => setCarregando(false));
  }, []);

  const entrar = async (email, senha) => {
    const { token, usuario } = await api.login({ email, senha });
    salvarToken(token);
    setUsuario(usuario);
    return usuario;
  };

  const registrar = async dados => {
    const { token, usuario } = await api.registrar(dados);
    salvarToken(token);
    setUsuario(usuario);
    return usuario;
  };

  const sair = () => {
    limparToken();
    setUsuario(null);
  };

  const recarregarUsuario = async () => {
    const { usuario } = await api.eu();
    setUsuario(usuario);
    return usuario;
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, registrar, sair, recarregarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
