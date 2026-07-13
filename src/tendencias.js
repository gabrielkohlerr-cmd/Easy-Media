/* Sugestões de conteúdo por segmento, para a página "Início" do social media.
   Não vêm de uma API de tendências ao vivo (não temos uma integrada) — são um banco
   de sugestões por segmento que roda de forma determinística por dia do ano, então
   muda diariamente mas de forma previsível, sem precisar de uma fonte externa. */
const BANCO_TENDENCIAS = {
  "Alimentação e Gastronomia": [
    "Vídeos de bastidores da cozinha (\"como é feito\") estão com bom engajamento.",
    "Combos e promoções por tempo limitado funcionam bem em Stories com contagem regressiva.",
    "Receitas rápidas em Reels de até 30s seguem entre os formatos mais compartilhados.",
    "Depoimentos de clientes durante o consumo geram mais confiança que fotos de prato pronto.",
    "Enquetes sobre qual prato lançar aumentam a participação do público antes da estreia.",
  ],
  "Moda e Beleza": [
    "Conteúdo de \"antes e depois\" segue entre os formatos que mais convertem.",
    "Provador de looks em Reels, com transição rápida entre peças, está em alta.",
    "Parcerias com microinfluenciadores locais geram mais confiança que grandes nomes agora.",
    "Tutoriais curtos de styling performam bem em formato Carrossel.",
    "Bastidores de produção aumentam a percepção de qualidade da marca.",
  ],
  "Saúde e Bem-estar": [
    "Conteúdo educativo em formato de perguntas frequentes gera bom alcance orgânico.",
    "Depoimentos reais de pacientes (com autorização) aumentam a confiança na marca.",
    "Rotinas rápidas em vídeo curto convertem mais que textos longos.",
    "Mitos vs. verdades do segmento é um formato com alto compartilhamento.",
    "Bastidores da equipe humanizam a marca e reduzem objeções antes da conversão.",
  ],
  "Fitness e Esportes": [
    "Desafios de poucos dias engajam bem quando têm início e fim claros.",
    "Antes/depois de alunos reais, com autorização, seguem entre os formatos mais persuasivos.",
    "Bastidores de treino da equipe aproximam a marca do público.",
    "Séries curtas de exercícios em Reels têm boa taxa de salvamento.",
    "Conteúdo sobre erros comuns no treino gera comentários e discussão.",
  ],
  "Educação": [
    "Aulas-relâmpago (\"aprenda em 60 segundos\") continuam com boa retenção em Reels.",
    "Depoimentos de alunos sobre resultados reais aumentam a confiança antes da matrícula.",
    "Bastidores de produção de aulas humanizam professores e instituições.",
    "Conteúdo em formato de checklist tem alta taxa de salvamento.",
    "Enquetes sobre dúvidas do público ajudam a pautar o próximo conteúdo.",
  ],
  "Imobiliário": [
    "Tours em vídeo do imóvel, com narração direta, convertem mais que fotos estáticas.",
    "Conteúdo educativo sobre financiamento e documentação gera bom alcance orgânico.",
    "Antes/depois de reformas ou home staging chamam atenção no feed.",
    "Depoimentos de quem já comprou ou alugou aumentam a confiança na marca.",
    "Bastidores de visitas (com autorização) humanizam o corretor ou a imobiliária.",
  ],
  "Varejo e E-commerce": [
    "Unboxing e provas de produto em vídeo curto seguem entre os formatos mais persuasivos.",
    "Promoções por tempo limitado em Stories com contagem regressiva aumentam a conversão.",
    "Depoimentos e avaliações reais de clientes reduzem objeções de compra.",
    "Conteúdo de \"como usar\" o produto no dia a dia gera mais salvamentos.",
    "Bastidores de embalagem e expedição humanizam a marca.",
  ],
  "Serviços Profissionais": [
    "Conteúdo educativo respondendo dúvidas frequentes gera bom alcance orgânico.",
    "Estudos de caso reais (com autorização) aumentam a percepção de autoridade.",
    "Bastidores do processo de trabalho humanizam o profissional ou escritório.",
    "Depoimentos de clientes atendidos seguem entre os formatos mais persuasivos.",
    "Conteúdo em formato de checklist tem alta taxa de salvamento.",
  ],
  "Tecnologia": [
    "Demonstrações rápidas de funcionalidades em vídeo curto convertem mais que texto.",
    "Comparativos \"antes e depois\" de usar a solução geram bom engajamento.",
    "Bastidores da equipe de produto humanizam a marca.",
    "Conteúdo educativo sobre o problema que a solução resolve gera alcance orgânico.",
    "Depoimentos de clientes reais aumentam a confiança antes da conversão.",
  ],
  "Turismo e Hospitalidade": [
    "Tours em vídeo do destino ou hospedagem convertem mais que fotos estáticas.",
    "Depoimentos reais de hóspedes aumentam a confiança na marca.",
    "Bastidores da experiência (check-in, equipe, preparo) humanizam o negócio.",
    "Promoções por tempo limitado em Stories com contagem regressiva aumentam reservas.",
    "Conteúdo de \"o que fazer em...\" gera bom alcance orgânico e salvamentos.",
  ],
  "Outro": [
    "Bastidores do processo de trabalho humanizam a marca e geram confiança.",
    "Depoimentos reais de clientes seguem entre os formatos mais persuasivos.",
    "Conteúdo educativo respondendo dúvidas frequentes gera bom alcance orgânico.",
    "Promoções por tempo limitado em Stories com contagem regressiva aumentam conversão.",
    "Enquetes sobre o próximo conteúdo aumentam a participação do público.",
  ],
};

function diaDoAno(data) {
  const inicio = new Date(data.getFullYear(), 0, 0);
  return Math.floor((data - inicio) / 86400000);
}

export function tendenciaDoDia(segmento, deslocamento = 0, data = new Date()) {
  const lista = BANCO_TENDENCIAS[segmento] || BANCO_TENDENCIAS.Outro;
  const indice = (diaDoAno(data) + deslocamento) % lista.length;
  return lista[indice];
}
