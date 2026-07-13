import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Cartao, Botao } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
};

export default function ConvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { usuario, entrar, registrar, recarregarUsuario } = useAuth();

  const [convite, setConvite] = useState(undefined);
  const [modo, setModo] = useState("cadastrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aceito, setAceito] = useState(false);

  useEffect(() => {
    api.infoConvite(token).then(({ convite }) => setConvite(convite)).catch(() => setConvite(null));
  }, [token]);

  if (convite === undefined) return null;

  if (!convite || convite.status !== "pendente") {
    return (
      <Tela>
        <Cartao style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: TINTA }}>Convite indisponível</h1>
          <p style={{ color: CINZA, fontWeight: 600 }}>
            Esse link de convite já foi usado, revogado ou não existe.
          </p>
          <Botao onClick={() => navigate("/")}>Ir para a Easy Media</Botao>
        </Cartao>
      </Tela>
    );
  }

  const agenciaNome = convite.agencia_negocio || convite.agencia_nome;

  if (aceito) {
    return (
      <Tela>
        <Cartao style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: TINTA }}>Você entrou no squad de {agenciaNome}!</h1>
          <p style={{ color: CINZA, fontWeight: 600 }}>Agora você já pode acessar o painel de conteúdo.</p>
          <Botao onClick={() => navigate("/painel")}>Ir para o painel</Botao>
        </Cartao>
      </Tela>
    );
  }

  if (usuario?.tipo === "agencia") {
    return (
      <Tela>
        <Cartao style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: CINZA, fontWeight: 600 }}>
            Convites de squad são apenas para contas de Social Media. Você está logado como agência.
          </p>
        </Cartao>
      </Tela>
    );
  }

  const aceitarComoLogado = async () => {
    setErro(""); setEnviando(true);
    try {
      await api.aceitarConvite(token);
      await recarregarUsuario();
      setAceito(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (usuario?.tipo === "social_media") {
    return (
      <Tela>
        <Cartao style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 32 }}>🤝</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: TINTA }}>
            Você foi convidado por {agenciaNome}
          </h1>
          <p style={{ color: CINZA, fontWeight: 600 }}>
            Ao aceitar, você passa a integrar o squad dessa agência.
          </p>
          {erro && <div style={{ color: ROSA, fontWeight: 700, marginBottom: 10 }}>{erro}</div>}
          <Botao onClick={aceitarComoLogado}>{enviando ? "Aceitando…" : "Aceitar convite"}</Botao>
        </Cartao>
      </Tela>
    );
  }

  const submeter = async e => {
    e.preventDefault();
    setErro(""); setEnviando(true);
    try {
      if (modo === "cadastrar") {
        await registrar({ nome, email, senha, tipo: "social_media", conviteToken: token });
      } else {
        await entrar(email, senha);
        await api.aceitarConvite(token);
        await recarregarUsuario();
      }
      setAceito(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tela>
      <Cartao style={{ padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>🤝</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: TINTA, margin: "8px 0 4px" }}>
            Você foi convidado por {agenciaNome}
          </h1>
          <p style={{ color: CINZA, fontWeight: 600, fontSize: 14, margin: 0 }}>
            {modo === "cadastrar"
              ? "Crie sua conta de Social Media pra entrar direto no squad."
              : "Entre com sua conta de Social Media pra aceitar o convite."}
          </p>
        </div>

        <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
          {modo === "cadastrar" && (
            <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={campoEstilo} />
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" style={campoEstilo} />
          <input required type="password" minLength={6} value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" style={campoEstilo} />
          {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
          <Botao type="submit">
            {enviando ? "Enviando…" : modo === "cadastrar" ? "Criar conta e entrar no squad" : "Entrar e aceitar convite"}
          </Botao>
        </form>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={() => setModo(modo === "cadastrar" ? "entrar" : "cadastrar")} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: ROXO, padding: 0,
          }}>
            {modo === "cadastrar" ? "Já tenho conta de Social Media" : "Ainda não tenho conta"}
          </button>
        </div>
      </Cartao>
    </Tela>
  );
}

function Tela({ children }) {
  return (
    <div style={{
      minHeight: "100vh", background: LAVANDA, color: TINTA,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
    </div>
  );
}
