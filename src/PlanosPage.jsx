import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROXO, ROXO_ESCURO, ROXO_CLARO, LAVANDA, TINTA, CINZA, VERDE } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { IconeCheck, IconeEstrela } from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import {
  PLANOS_AGENCIA, FUNCIONALIDADES_INCLUSAS, PACOTES_CLIENTES_FREELANCER,
  formatarPreco, precoAnual, precoAnualPorMes,
} from "./planos.js";

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

function SeletorCiclo({ ciclo, aoAlterar }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "inline-flex", gap: 4, background: LAVANDA, borderRadius: 999, padding: 4 }}>
        {["mensal", "anual"].map(c => (
          <button key={c} onClick={() => aoAlterar(c)} className="em-btn" style={{
            border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 13,
            padding: "9px 16px", borderRadius: 999,
            background: ciclo === c ? ROXO : "transparent", color: ciclo === c ? "#fff" : CINZA,
          }}>{c === "mensal" ? "Mensal" : "Anual"}</button>
        ))}
      </div>
      {ciclo === "anual" ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: VERDE }}>✓ Você está economizando 5% pagando anualmente</span>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 700, color: ROXO_CLARO }}>
          Vale a pena assinar anualmente — 5% de desconto no total do ano.
        </span>
      )}
    </div>
  );
}

function CartaoPlanoAgencia({ plano, ciclo, planoAtual, planoCicloAtual, aoEscolher }) {
  const ehAtual = planoAtual === plano.id && planoCicloAtual === ciclo;
  const preco = ciclo === "anual" ? precoAnual(plano.preco) : plano.preco;
  const porMes = ciclo === "anual" ? precoAnualPorMes(plano.preco) : null;

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
        <span style={{ fontSize: 28, fontWeight: 900, color: TINTA }}>{formatarPreco(preco)}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>{ciclo === "anual" ? " /ano" : " /mês"}</span>
        {ciclo === "anual" && (
          <div style={{ fontSize: 12, fontWeight: 700, color: CINZA, marginTop: 2 }}>
            equivale a {formatarPreco(porMes)}/mês
          </div>
        )}
      </div>
      <div style={{ display: "grid", gap: 6, fontSize: 13.5, fontWeight: 700, color: CINZA }}>
        <div>{plano.colaboradores ? `Até ${plano.colaboradores} colaboradores` : "Colaboradores ilimitados"}</div>
        <div>{plano.clientes ? `Até ${plano.clientes} clientes` : "Clientes ilimitados"}</div>
      </div>
      <Botao
        variante={ehAtual ? "claro" : plano.recomendado ? "primario" : "fantasma"}
        disabled={ehAtual}
        onClick={() => aoEscolher(plano)}
        style={{ marginTop: "auto" }}
      >
        {ehAtual ? "Plano atual" : `Assinar ${plano.nome}`}
      </Botao>
    </Cartao>
  );
}

function PlanosDeAgencia({ onboarding }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [ciclo, setCiclo] = useState("mensal");

  const carregar = () => { api.meuPlano().then(setStatus); };
  useEffect(carregar, []);

  const escolher = plano => {
    const preco = ciclo === "anual" ? precoAnual(plano.preco) : plano.preco;
    navigate("/planos/cartao", {
      state: { tipo: "plano", id: plano.id, nome: plano.nome, preco, ciclo, precoMensalBase: plano.preco },
    });
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {onboarding && (
        <Cartao style={{ background: ROXO_ESCURO, border: "none" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>🎉 Sua conta foi criada!</div>
          <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 600, fontSize: 13, marginTop: 4 }}>
            Escolha um plano abaixo pra liberar todos os recursos da sua agência.
          </div>
        </Cartao>
      )}

      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Planos para agências</h1>
        <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
          Escolha o plano de acordo com o tamanho do seu squad. O pagamento ainda não está integrado
          a um meio de cobrança real, então essa é uma simulação da experiência de compra.
        </p>
      </div>

      {status?.plano && (
        <Cartao style={{ background: LAVANDA }}>
          <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>
            Seu plano atual: {PLANOS_AGENCIA.find(p => p.id === status.plano)?.nome}
            {status.planoCiclo && ` (cobrança ${status.planoCiclo})`}
          </div>
          <div style={{ fontSize: 13, color: CINZA, fontWeight: 600, marginTop: 2 }}>
            {status.colaboradoresAtuais} colaboradores no squad · {status.clientesCadastrados} clientes na carteira
          </div>
        </Cartao>
      )}

      <SeletorCiclo ciclo={ciclo} aoAlterar={setCiclo} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 8 }}>
        {PLANOS_AGENCIA.map(plano => (
          <CartaoPlanoAgencia
            key={plano.id} plano={plano} ciclo={ciclo}
            planoAtual={status?.plano} planoCicloAtual={status?.planoCiclo}
            aoEscolher={escolher}
          />
        ))}
      </div>

      <CartaoFuncionalidades />
    </div>
  );
}

function PlanoDeFreelancer() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  const carregar = () => { api.meuPlano().then(setStatus); };
  useEffect(carregar, []);

  const comprar = pacote => {
    navigate("/planos/cartao", {
      state: { tipo: "pacote", id: pacote.id, nome: pacote.nome, preco: pacote.preco, mensal: false },
    });
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
            <Botao variante="fantasma" onClick={() => comprar(pacote)} style={{ marginTop: "auto" }}>
              Comprar pacote
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
  const location = useLocation();
  const { usuario } = useAuth();

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
          ? <PlanosDeAgencia onboarding={location.state?.onboarding} />
          : <PlanoDeFreelancer />}
      </main>
    </div>
  );
}
