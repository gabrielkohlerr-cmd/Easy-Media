import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA, VERDE } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { formatarPreco } from "./planos.js";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
  fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
};

function formatarNumeroCartao(v) {
  const digitos = v.replace(/\D/g, "").slice(0, 16);
  return digitos.replace(/(.{4})/g, "$1 ").trim();
}

function formatarValidade(v) {
  const digitos = v.replace(/\D/g, "").slice(0, 4);
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function validadeValida(v) {
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12) return false;
  const expira = new Date(2000 + Number(m[2]), mes, 1); // primeiro dia do mês seguinte ao vencimento
  return expira > new Date();
}

function TelaCentral({ children }) {
  return (
    <div style={{
      minHeight: "100vh", background: LAVANDA, color: TINTA,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {children}
    </div>
  );
}

export default function PagamentoCartaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recarregarUsuario } = useAuth();
  const pedido = location.state;

  const [numero, setNumero] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);

  if (!pedido) {
    return (
      <TelaCentral>
        <Cartao style={{ padding: 32, textAlign: "center", maxWidth: 420, width: "100%" }}>
          <p style={{ color: CINZA, fontWeight: 600 }}>Nenhum plano selecionado.</p>
          <Botao onClick={() => navigate("/planos")}>Voltar pra planos</Botao>
        </Cartao>
      </TelaCentral>
    );
  }

  const submeter = async e => {
    e.preventDefault();
    setErro("");

    const digitosCartao = numero.replace(/\D/g, "");
    if (digitosCartao.length < 13) return setErro("Informe um número de cartão válido.");
    if (!nomeCartao.trim()) return setErro("Informe o nome como está no cartão.");
    if (!validadeValida(validade)) return setErro("Validade inválida ou cartão vencido.");
    if (!/^\d{3,4}$/.test(cvv)) return setErro("CVV inválido.");

    setProcessando(true);
    try {
      if (pedido.tipo === "plano") {
        await api.escolherPlanoAgencia(pedido.id, pedido.ciclo);
      } else {
        await api.comprarPacoteClientes(pedido.id);
      }
      await recarregarUsuario();
      navigate("/planos/confirmacao", { state: pedido });
    } catch (err) {
      setErro(err.message);
      setProcessando(false);
    }
  };

  return (
    <TelaCentral>
      <Cartao style={{ maxWidth: 460, width: "100%", padding: 32 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: CINZA, textTransform: "uppercase", letterSpacing: ".5px" }}>
            Resumo do pedido
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: TINTA, marginTop: 4 }}>{pedido.nome}</div>
          <div>
            <span style={{ fontSize: 24, fontWeight: 900, color: TINTA }}>{formatarPreco(pedido.preco)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>
              {pedido.ciclo === "anual" ? " /ano" : pedido.mensal ? " /mês" : ""}
            </span>
          </div>
          {pedido.ciclo === "anual" && (
            <div style={{ fontSize: 12, fontWeight: 700, color: VERDE, marginTop: 2 }}>
              Você está economizando 5% assinando anualmente
            </div>
          )}
        </div>

        <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            Número do cartão
            <input
              required value={numero} onChange={e => setNumero(formatarNumeroCartao(e.target.value))}
              placeholder="0000 0000 0000 0000" inputMode="numeric" style={campoEstilo}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            Nome no cartão
            <input
              required value={nomeCartao} onChange={e => setNomeCartao(e.target.value.toUpperCase())}
              placeholder="COMO ESTÁ IMPRESSO NO CARTÃO" style={campoEstilo}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
              Validade
              <input
                required value={validade} onChange={e => setValidade(formatarValidade(e.target.value))}
                placeholder="MM/AA" inputMode="numeric" style={campoEstilo}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
              CVV
              <input
                required value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123" inputMode="numeric" style={campoEstilo}
              />
            </label>
          </div>

          {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}

          <Botao type="submit" disabled={processando}>
            {processando ? "Processando pagamento…" : "Confirmar pagamento"}
          </Botao>
        </form>

        <p style={{
          margin: "16px 0 0", fontSize: 11.5, color: CINZA, fontWeight: 600,
          background: LAVANDA, borderRadius: 12, padding: "10px 14px",
        }}>
          Ambiente de simulação: nenhum dado de cartão é enviado ou armazenado — é só uma demonstração
          da experiência de compra, sem cobrança real.
        </p>

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button onClick={() => navigate(-1)} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: CINZA,
            textDecoration: "underline", padding: 0,
          }}>Voltar</button>
        </div>
      </Cartao>
    </TelaCentral>
  );
}
