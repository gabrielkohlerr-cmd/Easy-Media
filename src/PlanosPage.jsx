import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO_CLARO, LAVANDA, TINTA, CINZA, VERDE } from "./theme.js";
import { Botao, Cartao, Toast } from "./components.jsx";
import { IconeCheck, IconeEstrela } from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { PLANOS_AGENCIA, FUNCIONALIDADES_INCLUSAS, PACOTES_CLIENTES_FREELANCER, formatarPreco } from "./planos.js";

function CartaoFuncionalidades() {
  return (
    <Cartao>
      <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: TINTA }}>
        Funcionalidades incluídas em todos os planos
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {FUNCIONALIDADES_INCLUSAS.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ color: VERDE, marginTop: 2, flexShrink: 0 }}><IconeCheck tamanho={16} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: CINZA }}>{f}</span>
          </div>
        ))}
      </div>
    </Cartao>
  );
}

function CartaoPlanoAgencia({ plano, planoAtual, aoEscolher, escolhendo }) {
  const ehAtual = planoAtual === plano.id;
  return (
    <Cartao style={{
      display: "flex", flexDirection: "column", gap: 12, position: "relative",
      border: plano.recomendado ? `2px solid ${ROXO_CLARO}` : undefined,
    }}>
      {plano.recomendado && (
        <div style={{
          position: "absolute", top: -12, left: 20, display: "flex", alignItems: "center", gap: 5,
          background: ROXO_CLARO, color: "#fff", fontSize: 12, fontWeight: 800,
          padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap",
        }}>
          <IconeEstrela tamanho={12} /> Recomendado
        </div>
      )}
      <h3 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 900, color: TINTA }}>{plano.nome}</h3>
      <div>
        <span style={{ fontSize: 28, fontWeight: 900, color: TINTA }}>{formatarPreco(plano.preco)}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}> /mês</span>
      </div>
      <div style={{ display: "grid", gap: 6, fontSize: 13.5, fontWeight: 700, color: CINZA }}>
        <div>{plano.colaboradores ? `Até ${plano.colaboradores} colaboradores` : "Colaboradores ilimitados"}</div>
        <div>{plano.clientes ? `Até ${plano.clientes} clientes` : "Clientes ilimitados"}</div>
      </div>
      <Botao
        variante={ehAtual ? "claro" : plano.recomendado ? "primario" : "fantasma"}
        disabled={ehAtual || escolhendo === plano.id}
        onClick={() => aoEscolher(plano)}
        style={{ marginTop: "auto" }}
      >
        {ehAtual ? "Plano atual" : escolhendo === plano.id ? "Ativando…" : `Escolher ${plano.nome}`}
      </Botao>
    </Cartao>
  );
}

function PlanosDeAgencia({ mostrar }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [escolhendo, setEscolhendo] = useState(null);

  const carregar = () => { api.meuPlano().then(setStatus); };
  useEffect(carregar, []);

  const escolher = async plano => {
    setEscolhendo(plano.id);
    try {
      await api.escolherPlanoAgencia(plano.id);
      navigate("/planos/confirmacao", { state: { tipo: "plano", nome: plano.nome, preco: plano.preco, mensal: true } });
    } catch (err) {
      mostrar(err.message);
      setEscolhendo(null);
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Planos para agências</h1>
        <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
          Escolha o plano de acordo com o tamanho do seu squad. Cobrança mensal — o pagamento ainda
          não está integrado, então essa é uma simulação da experiência de compra.
        </p>
      </div>

      {status?.plano && (
        <Cartao style={{ background: LAVANDA }}>
          <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>
            Seu plano atual: {PLANOS_AGENCIA.find(p => p.id === status.plano)?.nome}
          </div>
          <div style={{ fontSize: 13, color: CINZA, fontWeight: 600, marginTop: 2 }}>
            {status.colaboradoresAtuais} colaboradores no squad · {status.clientesCadastrados} clientes na carteira
          </div>
        </Cartao>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 8 }}>
        {PLANOS_AGENCIA.map(plano => (
          <CartaoPlanoAgencia
            key={plano.id} plano={plano} planoAtual={status?.plano}
            aoEscolher={escolher} escolhendo={escolhendo}
          />
        ))}
      </div>

      <CartaoFuncionalidades />
    </div>
  );
}

function PlanoDeFreelancer({ mostrar }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [comprando, setComprando] = useState(null);

  const carregar = () => { api.meuPlano().then(setStatus); };
  useEffect(carregar, []);

  const comprar = async pacote => {
    setComprando(pacote.id);
    try {
      await api.comprarPacoteClientes(pacote.id);
      navigate("/planos/confirmacao", { state: { tipo: "pacote", nome: pacote.nome, preco: pacote.preco, mensal: false } });
    } catch (err) {
      mostrar(err.message);
      setComprando(null);
    }
  };

  if (status?.gerenciadoPelaAgencia) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Seu plano</h1>
        </div>
        <Cartao>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TINTA }}>
            Você faz parte do squad de uma agência.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: CINZA, fontWeight: 600 }}>
            O plano e os limites de clientes são gerenciados pela agência, não individualmente.
          </p>
        </Cartao>
        <CartaoFuncionalidades />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Seu plano</h1>
        <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
          Como social media freelancer, seu cadastro é gratuito pra até {status?.limiteGratis ?? 20} clientes.
          Depois disso, compre pacotes extras — o pagamento ainda não está integrado, então essa é
          uma simulação da experiência de compra.
        </p>
      </div>

      {status && (
        <Cartao style={{ background: LAVANDA }}>
          <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>Plano gratuito</div>
          <div style={{ fontSize: 13, color: CINZA, fontWeight: 600, marginTop: 2 }}>
            {status.clientesCadastrados} de {status.totalPermitido} clientes usados
            {status.pacoteClientesExtra > 0 && ` (${status.limiteGratis} grátis + ${status.pacoteClientesExtra} comprados)`}
          </div>
        </Cartao>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 8 }}>
        {PACOTES_CLIENTES_FREELANCER.map(pacote => (
          <Cartao key={pacote.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: TINTA }}>{pacote.nome}</h3>
            <div>
              <span style={{ fontSize: 26, fontWeight: 900, color: TINTA }}>{formatarPreco(pacote.preco)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}> pagamento único</span>
            </div>
            <Botao
              variante="fantasma" disabled={comprando === pacote.id}
              onClick={() => comprar(pacote)} style={{ marginTop: "auto" }}
            >
              {comprando === pacote.id ? "Comprando…" : "Comprar pacote"}
            </Botao>
          </Cartao>
        ))}
      </div>

      <CartaoFuncionalidades />
    </div>
  );
}

export default function PlanosPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(0,0,0,.88)",
        backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.1)",
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Planos</span>
          <Botao
            pequeno variante="fantasmaClaro"
            onClick={() => navigate(usuario?.tipo === "agencia" ? "/agencia" : "/clientes")}
          >Voltar</Botao>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
        {usuario?.tipo === "agencia"
          ? <PlanosDeAgencia mostrar={mostrar} />
          : <PlanoDeFreelancer mostrar={mostrar} />}
      </main>

      <Toast msg={toast} />
    </div>
  );
}
