import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LAVANDA, TINTA, CINZA, VERDE } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { IconeCheck } from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { formatarPreco } from "./planos.js";

export default function PagamentoConfirmadoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const detalhe = location.state;

  const voltar = () => navigate(usuario?.tipo === "agencia" ? "/agencia" : "/clientes");

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Cartao style={{ maxWidth: 440, width: "100%", textAlign: "center", padding: 36 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: `${VERDE}1a`, color: VERDE,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
        }}>
          <IconeCheck tamanho={30} />
        </div>

        {detalhe ? (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TINTA }}>Pagamento confirmado</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: CINZA, fontWeight: 600 }}>
              {detalhe.tipo === "plano"
                ? <>Seu plano <strong style={{ color: TINTA }}>{detalhe.nome}</strong> já está ativo.</>
                : <>Seu pacote <strong style={{ color: TINTA }}>{detalhe.nome}</strong> já foi liberado na sua conta.</>}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 900, color: TINTA }}>
              {formatarPreco(detalhe.preco)}{detalhe.mensal ? " /mês" : ""}
            </p>
          </>
        ) : (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TINTA }}>Nada por aqui</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: CINZA, fontWeight: 600 }}>
              Nenhuma compra foi processada. Volte pra tela de planos pra escolher uma opção.
            </p>
          </>
        )}

        <p style={{
          margin: "20px 0 0", fontSize: 12, color: CINZA, fontWeight: 600,
          background: LAVANDA, borderRadius: 12, padding: "10px 14px",
        }}>
          A cobrança ainda não está integrada a um meio de pagamento real — essa tela simula a
          experiência de compra enquanto isso não é configurado.
        </p>

        <div style={{ marginTop: 22 }}>
          <Botao onClick={voltar}>Voltar</Botao>
        </div>
      </Cartao>
    </div>
  );
}
