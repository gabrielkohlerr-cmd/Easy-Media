/* Sugestões de conteúdo por segmento, para a página "Início" do social media.
   Não vêm de uma API de tendências ao vivo (não temos uma integrada) — são um banco
   de sugestões por segmento que roda de forma determinística por dia do ano, então
   muda diariamente mas de forma previsível, sem precisar de uma fonte externa.

   Cada item tem um "tema" (palavras-chave curtas) usado pra montar um link de
   referência real — uma busca no Google Notícias sobre aquele assunto no
   segmento do cliente, pra servir de referência (post em alta, notícia,
   material) na hora de planejar. Não é um link fixo pra uma matéria específica
   (que ficaria velho/quebrado com o tempo) — é uma busca sempre atual. */
const BANCO_TENDENCIAS = {
  "Alimentação e Gastronomia": [
    { texto: "Vídeos de bastidores da cozinha (\"como é feito\") estão com bom engajamento.", tema: "bastidores de cozinha restaurante" },
    { texto: "Combos e promoções por tempo limitado funcionam bem em Stories com contagem regressiva.", tema: "promoção relâmpago restaurante" },
    { texto: "Receitas rápidas em Reels de até 30s seguem entre os formatos mais compartilhados.", tema: "receita rápida reels" },
    { texto: "Depoimentos de clientes durante o consumo geram mais confiança que fotos de prato pronto.", tema: "depoimento cliente restaurante" },
    { texto: "Enquetes sobre qual prato lançar aumentam a participação do público antes da estreia.", tema: "lançamento de prato novo cardápio" },
  ],
  "Moda e Beleza": [
    { texto: "Conteúdo de \"antes e depois\" segue entre os formatos que mais convertem.", tema: "antes e depois moda beleza" },
    { texto: "Provador de looks em Reels, com transição rápida entre peças, está em alta.", tema: "provador de looks reels" },
    { texto: "Parcerias com microinfluenciadores locais geram mais confiança que grandes nomes agora.", tema: "microinfluenciador marketing de moda" },
    { texto: "Tutoriais curtos de styling performam bem em formato Carrossel.", tema: "tutorial de styling carrossel" },
    { texto: "Bastidores de produção aumentam a percepção de qualidade da marca.", tema: "bastidores produção moda" },
  ],
  "Saúde e Bem-estar": [
    { texto: "Conteúdo educativo em formato de perguntas frequentes gera bom alcance orgânico.", tema: "perguntas frequentes saúde" },
    { texto: "Depoimentos reais de pacientes (com autorização) aumentam a confiança na marca.", tema: "depoimento de paciente clínica" },
    { texto: "Rotinas rápidas em vídeo curto convertem mais que textos longos.", tema: "rotina de bem-estar vídeo curto" },
    { texto: "Mitos vs. verdades do segmento é um formato com alto compartilhamento.", tema: "mitos e verdades saúde" },
    { texto: "Bastidores da equipe humanizam a marca e reduzem objeções antes da conversão.", tema: "bastidores equipe clínica saúde" },
  ],
  "Fitness e Esportes": [
    { texto: "Desafios de poucos dias engajam bem quando têm início e fim claros.", tema: "desafio fitness rede social" },
    { texto: "Antes/depois de alunos reais, com autorização, seguem entre os formatos mais persuasivos.", tema: "antes e depois academia" },
    { texto: "Bastidores de treino da equipe aproximam a marca do público.", tema: "bastidores treino personal" },
    { texto: "Séries curtas de exercícios em Reels têm boa taxa de salvamento.", tema: "série de exercícios reels" },
    { texto: "Conteúdo sobre erros comuns no treino gera comentários e discussão.", tema: "erros comuns no treino academia" },
  ],
  "Educação": [
    { texto: "Aulas-relâmpago (\"aprenda em 60 segundos\") continuam com boa retenção em Reels.", tema: "aula relâmpago reels educação" },
    { texto: "Depoimentos de alunos sobre resultados reais aumentam a confiança antes da matrícula.", tema: "depoimento de aluno resultado" },
    { texto: "Bastidores de produção de aulas humanizam professores e instituições.", tema: "bastidores produção de aulas" },
    { texto: "Conteúdo em formato de checklist tem alta taxa de salvamento.", tema: "checklist educação conteúdo" },
    { texto: "Enquetes sobre dúvidas do público ajudam a pautar o próximo conteúdo.", tema: "enquete dúvidas alunos" },
  ],
  "Imobiliário": [
    { texto: "Tours em vídeo do imóvel, com narração direta, convertem mais que fotos estáticas.", tema: "tour em vídeo de imóvel" },
    { texto: "Conteúdo educativo sobre financiamento e documentação gera bom alcance orgânico.", tema: "financiamento imobiliário dicas" },
    { texto: "Antes/depois de reformas ou home staging chamam atenção no feed.", tema: "home staging antes e depois" },
    { texto: "Depoimentos de quem já comprou ou alugou aumentam a confiança na marca.", tema: "depoimento comprador imóvel" },
    { texto: "Bastidores de visitas (com autorização) humanizam o corretor ou a imobiliária.", tema: "bastidores visita imobiliária" },
  ],
  "Varejo e E-commerce": [
    { texto: "Unboxing e provas de produto em vídeo curto seguem entre os formatos mais persuasivos.", tema: "unboxing produto vídeo curto" },
    { texto: "Promoções por tempo limitado em Stories com contagem regressiva aumentam a conversão.", tema: "promoção relâmpago e-commerce" },
    { texto: "Depoimentos e avaliações reais de clientes reduzem objeções de compra.", tema: "avaliação de cliente e-commerce" },
    { texto: "Conteúdo de \"como usar\" o produto no dia a dia gera mais salvamentos.", tema: "como usar o produto dia a dia" },
    { texto: "Bastidores de embalagem e expedição humanizam a marca.", tema: "bastidores embalagem expedição" },
  ],
  "Serviços Profissionais": [
    { texto: "Conteúdo educativo respondendo dúvidas frequentes gera bom alcance orgânico.", tema: "dúvidas frequentes serviços profissionais" },
    { texto: "Estudos de caso reais (com autorização) aumentam a percepção de autoridade.", tema: "estudo de caso serviços profissionais" },
    { texto: "Bastidores do processo de trabalho humanizam o profissional ou escritório.", tema: "bastidores processo de trabalho" },
    { texto: "Depoimentos de clientes atendidos seguem entre os formatos mais persuasivos.", tema: "depoimento de cliente atendido" },
    { texto: "Conteúdo em formato de checklist tem alta taxa de salvamento.", tema: "checklist serviços profissionais" },
  ],
  "Tecnologia": [
    { texto: "Demonstrações rápidas de funcionalidades em vídeo curto convertem mais que texto.", tema: "demonstração de funcionalidade produto tech" },
    { texto: "Comparativos \"antes e depois\" de usar a solução geram bom engajamento.", tema: "antes e depois solução de tecnologia" },
    { texto: "Bastidores da equipe de produto humanizam a marca.", tema: "bastidores equipe de produto tech" },
    { texto: "Conteúdo educativo sobre o problema que a solução resolve gera alcance orgânico.", tema: "problema que a solução resolve tech" },
    { texto: "Depoimentos de clientes reais aumentam a confiança antes da conversão.", tema: "depoimento cliente software" },
  ],
  "Turismo e Hospitalidade": [
    { texto: "Tours em vídeo do destino ou hospedagem convertem mais que fotos estáticas.", tema: "tour em vídeo destino turístico" },
    { texto: "Depoimentos reais de hóspedes aumentam a confiança na marca.", tema: "depoimento de hóspede hotel" },
    { texto: "Bastidores da experiência (check-in, equipe, preparo) humanizam o negócio.", tema: "bastidores experiência hotel pousada" },
    { texto: "Promoções por tempo limitado em Stories com contagem regressiva aumentam reservas.", tema: "promoção relâmpago turismo" },
    { texto: "Conteúdo de \"o que fazer em...\" gera bom alcance orgânico e salvamentos.", tema: "o que fazer em roteiro turístico" },
  ],
  "Outro": [
    { texto: "Bastidores do processo de trabalho humanizam a marca e geram confiança.", tema: "bastidores processo de trabalho marca" },
    { texto: "Depoimentos reais de clientes seguem entre os formatos mais persuasivos.", tema: "depoimento real de cliente" },
    { texto: "Conteúdo educativo respondendo dúvidas frequentes gera bom alcance orgânico.", tema: "dúvidas frequentes marca" },
    { texto: "Promoções por tempo limitado em Stories com contagem regressiva aumentam conversão.", tema: "promoção relâmpago stories" },
    { texto: "Enquetes sobre o próximo conteúdo aumentam a participação do público.", tema: "enquete próximo conteúdo rede social" },
  ],
};

function diaDoAno(data) {
  const inicio = new Date(data.getFullYear(), 0, 0);
  return Math.floor((data - inicio) / 86400000);
}

/* link de referência real — uma busca no Google Notícias (sempre atual, sem
   risco de virar um link morto) combinando o tema do item com o segmento */
export function linkReferenciaTendencia(tema, segmento) {
  const consulta = `${tema} ${segmento}`;
  return `https://news.google.com/search?q=${encodeURIComponent(consulta)}&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;
}

function itemComLink(item, segmento) {
  return { texto: item.texto, tema: item.tema, link: linkReferenciaTendencia(item.tema, segmento) };
}

export function tendenciaDoDia(segmento, deslocamento = 0, data = new Date()) {
  const lista = BANCO_TENDENCIAS[segmento] || BANCO_TENDENCIAS.Outro;
  const indice = (diaDoAno(data) + deslocamento) % lista.length;
  return itemComLink(lista[indice], segmento);
}

/* encontra a data mais recente (<= hoje) em que esse índice da lista teria
   sido "a tendência do dia" — dá pra ver há quanto tempo aquele item apareceu
   em destaque e julgar se ainda vale a pena considerar */
function ultimaOcorrencia(indice, tamanhoLista, hoje) {
  for (let voltar = 0; voltar <= tamanhoLista; voltar++) {
    const candidata = new Date(hoje);
    candidata.setDate(candidata.getDate() - voltar);
    if (((diaDoAno(candidata) % tamanhoLista) + tamanhoLista) % tamanhoLista === indice) return candidata;
  }
  return hoje;
}

/* todas as tendências cadastradas pro segmento, cada uma com a data mais
   recente em que foi destaque — usado no "Ver todas as tendências" */
export function todasTendencias(segmento, data = new Date()) {
  const lista = BANCO_TENDENCIAS[segmento] || BANCO_TENDENCIAS.Outro;
  const indiceHoje = ((diaDoAno(data) % lista.length) + lista.length) % lista.length;
  return lista
    .map((item, indice) => ({
      ...itemComLink(item, segmento),
      ultimaVez: ultimaOcorrencia(indice, lista.length, data),
      ehHoje: indice === indiceHoje,
    }))
    .sort((a, b) => b.ultimaVez - a.ultimaVez);
}
