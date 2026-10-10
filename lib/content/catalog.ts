import { additionalStudyContents } from "./enrichment";
import { resources, videoSearch } from "./resources";

export type StudyContent = {
  slug: string;
  title: string;
  subject: string;
  area: string;
  summary: string;
  keyPoints: string[];
  example: { prompt: string; solution: string };
  commonMistakes: string[];
  formula?: string;
  visual?: "percentage" | "equation" | "triangle" | "cell" | "energy" | "argument";
  steps?: { title: string; description: string }[];
  resources?: { label: string; url: string; kind: "leitura" | "videoaula" | "oficial" }[];
};

export const officialEnemArchiveUrl =
  "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";

const coreStudyContents: StudyContent[] = [
  {
    slug: "porcentagem",
    title: "Porcentagem",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "Porcentagem expressa uma razão cujo denominador é 100. Ela aparece em descontos, aumentos, pesquisas e comparação de quantidades.",
    keyPoints: [
      "p% de um valor x é (p ÷ 100) × x.",
      "Um aumento de p% multiplica o valor por 1 + p/100.",
      "Um desconto de p% multiplica o valor por 1 − p/100.",
      "Aumentos e descontos sucessivos são aplicados sobre o valor atualizado.",
    ],
    example: {
      prompt: "Um produto custa R$ 300 e recebe desconto de 20%. Qual é o preço final?",
      solution:
        "O desconto é 0,20 × 300 = R$ 60. Subtraindo do preço inicial: 300 − 60 = R$ 240.",
    },
    commonMistakes: [
      "Calcular a porcentagem sobre o valor errado depois de uma alteração.",
      "Somar percentuais de mudanças sucessivas como se tivessem a mesma base.",
    ],
    formula: "valor final = valor inicial × (1 ± p/100)",
    visual: "percentage",
    resources: resources({ label: "Porcentagem · Toda Matéria", url: "https://www.todamateria.com.br/porcentagem/" }, "porcentagem e descontos · Professor Ferretto"),
  },
  {
    slug: "razao-e-proporcao",
    title: "Razão e proporção",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "Razão compara duas grandezas por uma divisão. Uma proporção é a igualdade entre duas razões e pode ajudar a encontrar um valor desconhecido.",
    keyPoints: [
      "Na razão a:b, a ordem dos termos importa.",
      "Em uma proporção a/b = c/d, com denominadores não nulos, vale a × d = b × c.",
      "Grandezas diretamente proporcionais crescem ou diminuem na mesma razão.",
      "Confira se as unidades são compatíveis antes de comparar grandezas.",
    ],
    example: {
      prompt:
        "Se 3 cadernos custam R$ 12 e o preço por unidade é constante, quanto custam 5 cadernos?",
      solution: "O preço por caderno é 12 ÷ 3 = R$ 4. Para 5 cadernos: 5 × 4 = R$ 20.",
    },
    commonMistakes: [
      "Inverter apenas um dos lados da proporção.",
      "Assumir proporcionalidade direta sem verificar a relação entre as grandezas.",
    ],
    formula: "a/b = c/d  ⇒  a × d = b × c",
    resources: resources({ label: "Razão e proporção · Wikipédia", url: "https://pt.wikipedia.org/wiki/Propor%C3%A7%C3%A3o_(matem%C3%A1tica)" }, "razão e proporção · Matemática"),
  },
  {
    slug: "equacao-do-primeiro-grau",
    title: "Equação do 1º grau",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "Uma equação do primeiro grau pode ser escrita como ax + b = 0, com a diferente de zero. Resolver é encontrar o valor de x que torna a igualdade verdadeira.",
    keyPoints: [
      "Operações feitas em um membro da igualdade também devem ser feitas no outro.",
      "Termos podem ser agrupados para isolar a incógnita.",
      "Na forma ax + b = 0, a solução é x = −b/a.",
      "Substituir a solução na equação original ajuda a conferir o resultado.",
    ],
    example: {
      prompt: "Resolva 2x + 5 = 17.",
      solution:
        "Subtraindo 5 dos dois lados, 2x = 12. Dividindo os dois lados por 2, x = 6. A substituição confirma: 2 × 6 + 5 = 17.",
    },
    commonMistakes: [
      "Trocar um termo de lado sem inverter corretamente a operação.",
      "Dividir apenas um termo quando é necessário dividir todos os termos do membro.",
    ],
    formula: "ax + b = 0  ⇒  x = −b/a",
    visual: "equation",
    resources: resources({ label: "Equação · Toda Matéria", url: "https://www.todamateria.com.br/equacao-do-primeiro-grau/" }, "equação do primeiro grau · Professor Ferretto"),
  },
  {
    slug: "funcao-do-primeiro-grau", title: "Função do 1º grau", subject: "Matemática", area: "Matemática",
    summary: "A função afim relaciona duas variáveis por uma expressão linear. O coeficiente angular indica a taxa de variação; o termo independente indica o valor inicial.",
    keyPoints: ["Forma geral: f(x) = ax + b.", "Se a > 0, a função é crescente; se a < 0, decrescente.", "A raiz é o ponto em que o gráfico cruza o eixo x: x = −b/a.", "Problemas de tarifa, distância e custo podem ser modelados por uma função afim."],
    example: { prompt: "Uma corrida custa R$ 6 de taxa fixa mais R$ 2 por quilômetro. Quanto custa uma viagem de 8 km?", solution: "Modele por C(x) = 2x + 6. Então C(8) = 2 × 8 + 6 = R$ 22." },
    commonMistakes: ["Confundir o valor inicial b com a taxa a.", "Ler o gráfico sem observar a escala dos eixos."],
    formula: "f(x) = ax + b  |  raiz: x = −b/a", visual: "equation",
    resources: resources({ label: "Função afim · Toda Matéria", url: "https://www.todamateria.com.br/funcao-afim/" }, "função do primeiro grau · Matemática"),
  },
  {
    slug: "geometria-plana", title: "Áreas e perímetros", subject: "Matemática", area: "Matemática",
    summary: "Perímetro mede o contorno de uma figura; área mede a superfície. As unidades precisam acompanhar o tipo de medida: comprimento ou área.",
    keyPoints: ["Retângulo: A = base × altura.", "Triângulo: A = base × altura ÷ 2.", "Círculo: A = πr² e comprimento da circunferência C = 2πr.", "Ao ampliar todas as dimensões por k, o perímetro escala por k e a área por k²."],
    example: { prompt: "Um terreno retangular mede 12 m por 7 m. Qual é sua área e seu perímetro?", solution: "Área = 12 × 7 = 84 m². Perímetro = 2 × (12 + 7) = 38 m." },
    commonMistakes: ["Usar unidade linear para área.", "Esquecer o fator 1/2 na área do triângulo."],
    formula: "Aretângulo = b × h  |  Atriângulo = b × h/2  |  Acírculo = πr²", visual: "triangle",
    resources: resources({ label: "Geometria plana · Toda Matéria", url: "https://www.todamateria.com.br/geometria-plana/" }, "áreas de figuras planas · Professor Ferretto"),
  },
  {
    slug: "estatistica-media-mediana", title: "Estatística: média e mediana", subject: "Matemática", area: "Matemática",
    summary: "Medidas de tendência central resumem conjuntos de dados. A média usa todos os valores; a mediana depende da posição central após ordenar os dados.",
    keyPoints: ["Média aritmética = soma dos valores ÷ quantidade.", "Na média ponderada, cada valor é multiplicado por seu peso.", "Ordene os dados antes de encontrar a mediana.", "A mediana costuma resistir melhor a valores extremos."],
    example: { prompt: "Considere 4, 5, 6, 7 e 28. Qual é a média e a mediana?", solution: "Média = 50 ÷ 5 = 10. A mediana é o valor central da lista ordenada: 6." },
    commonMistakes: ["Calcular a mediana sem ordenar os dados.", "Interpretar média como um valor que necessariamente aparece na lista."],
    formula: "média = Σxᵢ/n  |  média ponderada = Σ(pᵢxᵢ)/Σpᵢ",
    resources: resources({ label: "Estatística · Toda Matéria", url: "https://www.todamateria.com.br/estatistica/" }, "média, mediana e moda · Matemática"),
  },
  {
    slug: "cinematica-velocidade", title: "Movimento e velocidade média", subject: "Física", area: "Ciências da Natureza",
    summary: "A velocidade média relaciona o deslocamento ao intervalo de tempo. Em problemas do cotidiano, observe as unidades e converta antes de comparar valores.",
    keyPoints: ["Velocidade média = deslocamento ÷ intervalo de tempo.", "1 m/s equivale a 3,6 km/h.", "Distância percorrida e deslocamento não são sempre iguais.", "Gráficos posição × tempo mostram a velocidade pela inclinação."],
    example: { prompt: "Um ônibus percorre 180 km em 3 horas, sem considerar paradas. Qual é a velocidade média?", solution: "vₘ = 180 ÷ 3 = 60 km/h." },
    commonMistakes: ["Misturar quilômetros com segundos sem converter.", "Confundir velocidade média com a média simples de velocidades em trechos diferentes."],
    formula: "vₘ = Δs/Δt", visual: "energy",
    resources: resources({ label: "Cinemática · Toda Matéria", url: "https://www.todamateria.com.br/cinematica/" }, "velocidade média · Física ENEM"),
  },
  {
    slug: "ecologia-cadeias-alimentares", title: "Ecologia e relações alimentares", subject: "Biologia", area: "Ciências da Natureza",
    summary: "Ecossistemas conectam organismos e fatores ambientais. A energia flui entre níveis tróficos e parte dela se dissipa como calor a cada transferência.",
    keyPoints: ["Produtores formam matéria orgânica a partir de fontes inorgânicas.", "Consumidores obtêm energia alimentando-se de outros organismos.", "Decompositores reciclam matéria no ecossistema.", "Uma teia alimentar reúne diversas cadeias interligadas."],
    example: { prompt: "Em capim → gafanhoto → sapo, quem é o produtor e quem é o consumidor secundário?", solution: "O capim é produtor; o gafanhoto é consumidor primário; o sapo é consumidor secundário." },
    commonMistakes: ["Dizer que a matéria flui em uma única direção como a energia.", "Achar que a seta aponta para quem é comido; ela indica transferência de matéria e energia para quem consome."],
    visual: "cell",
    resources: resources({ label: "Ecologia · Toda Matéria", url: "https://www.todamateria.com.br/ecologia/" }, "cadeia alimentar · Biologia ENEM"),
  },
  {
    slug: "quimica-misturas-separacao", title: "Misturas e separação de materiais", subject: "Química", area: "Ciências da Natureza",
    summary: "Misturas reúnem duas ou mais substâncias. A escolha do método de separação depende de propriedades como tamanho de partícula, densidade, solubilidade e ponto de ebulição.",
    keyPoints: ["Mistura homogênea apresenta uma fase visível; heterogênea, mais de uma.", "Filtração separa sólido não dissolvido de fluido.", "Decantação aproveita diferenças de densidade.", "Destilação separa componentes com diferentes temperaturas de ebulição."],
    example: { prompt: "Como separar areia e água? E água e sal dissolvido?", solution: "A filtração retém a areia. Para recuperar também o sal e a água, pode-se usar destilação simples: a água evapora e condensa, enquanto o sal permanece." },
    commonMistakes: ["Tratar dissolução como desaparecimento da substância.", "Escolher filtração para separar sal já dissolvido na água."],
    resources: resources({ label: "Separação de misturas · Toda Matéria", url: "https://www.todamateria.com.br/separacao-de-misturas/" }, "separação de misturas · Química"),
  },
  {
    slug: "interpretacao-de-texto", title: "Interpretação e inferência", subject: "Língua Portuguesa", area: "Linguagens",
    summary: "Interpretar é relacionar o que o texto diz, como diz e em que contexto circula. A resposta correta precisa de evidência no texto, mesmo quando a conclusão é implícita.",
    keyPoints: ["Diferencie informação explícita de inferência sustentada.", "Observe título, gênero, público e finalidade.", "Ironia depende da diferença entre sentido literal e contexto.", "Em textos multimodais, leia palavras, imagens, legenda e organização visual em conjunto."],
    example: { prompt: "Uma campanha mostra uma torneira seca e a frase 'Cada gota conta'. Qual efeito a imagem produz?", solution: "A imagem concretiza a escassez de água e reforça o apelo à economia; a interpretação combina linguagem verbal e visual." },
    commonMistakes: ["Escolher uma alternativa plausível, mas sem apoio no texto.", "Ignorar a situação de comunicação e o gênero textual."],
    resources: resources({ label: "Interpretação de texto · Toda Matéria", url: "https://www.todamateria.com.br/interpretacao-de-texto/" }, "interpretação de texto · Linguagens ENEM"),
  },
  {
    slug: "funcoes-da-linguagem", title: "Funções da linguagem", subject: "Língua Portuguesa", area: "Linguagens",
    summary: "As funções da linguagem destacam diferentes elementos da comunicação. Um texto pode combinar várias funções; identifique a predominante pelo objetivo principal.",
    keyPoints: ["Referencial: foco na informação e no contexto.", "Emotiva: foco nas marcas de quem fala.", "Conativa: busca influenciar o interlocutor.", "Metalinguística fala do próprio código; fática testa ou mantém o canal; poética destaca a construção da mensagem."],
    example: { prompt: "Em 'Doe sangue. Uma atitude simples salva vidas', qual função predomina?", solution: "A função conativa, pois o imperativo 'Doe' convoca diretamente o leitor a agir." },
    commonMistakes: ["Classificar apenas por uma palavra isolada.", "Supor que cada texto apresenta somente uma função."],
    resources: resources({ label: "Funções da linguagem · Toda Matéria", url: "https://www.todamateria.com.br/funcoes-da-linguagem/" }, "funções da linguagem · Português ENEM"),
  },
  {
    slug: "modernismo-brasileiro", title: "Modernismo brasileiro", subject: "Literatura", area: "Linguagens",
    summary: "O Modernismo brasileiro reúne movimentos diversos que questionaram modelos artísticos e buscaram novas formas de representar o país e suas contradições.",
    keyPoints: ["A Semana de Arte Moderna de 1922 tornou-se marco simbólico da primeira fase.", "A primeira fase valorizou experimentação, ruptura e linguagem coloquial.", "A segunda fase ampliou temas sociais e regionais na prosa e amadureceu a poesia.", "Analise forma e contexto sem reduzir uma obra a uma lista de características."],
    example: { prompt: "Como a linguagem cotidiana pode participar de um projeto modernista?", solution: "Ela aproxima a escrita da fala e questiona a ideia de que apenas a norma culta ou modelos europeus podem ser literários." },
    commonMistakes: ["Tratar todos os autores modernistas como se tivessem o mesmo estilo.", "Confundir marco histórico com início absoluto de toda inovação artística."],
    resources: resources({ label: "Modernismo · Toda Matéria", url: "https://www.todamateria.com.br/modernismo-no-brasil/" }, "modernismo brasileiro · Literatura ENEM"),
  },
  {
    slug: "leitura-em-ingles", title: "Estratégias de leitura em inglês", subject: "Inglês", area: "Linguagens",
    summary: "Na prova de língua estrangeira, compreender o propósito e as pistas do texto costuma ser mais útil do que traduzir palavra por palavra.",
    keyPoints: ["Leia título, fonte, gênero e elementos visuais antes de buscar detalhes.", "Cognatos ajudam, mas falsos cognatos exigem atenção ao contexto.", "Pronomes e conectores retomam ideias e organizam relações.", "Identifique se o texto informa, critica, convida, instrui ou entretém."],
    example: { prompt: "Um anúncio diz 'Save water. Every drop matters.' O que ele procura fazer?", solution: "O imperativo 'Save' e a frase sobre cada gota indicam um apelo para que o leitor economize água." },
    commonMistakes: ["Traduzir cada palavra e perder a ideia global.", "Ignorar a finalidade comunicativa do gênero."],
    resources: resources({ label: "Leitura em inglês · British Council", url: "https://learnenglish.britishcouncil.org/skills/reading" }, "interpretação de texto em inglês ENEM", "leitura em inglês"),
  },
  {
    slug: "arte-e-cultura", title: "Arte, cultura e leitura de imagens", subject: "Artes", area: "Linguagens",
    summary: "Uma obra pode ser analisada por seus elementos visuais, contexto de produção, circulação e relações com identidades e disputas sociais.",
    keyPoints: ["Observe forma, material, cor, composição e suporte.", "Relacione a obra ao contexto sem supor que ele determina um único sentido.", "A cultura é dinâmica: tradições se transformam e convivem.", "Reconheça diferentes matrizes culturais e evite hierarquizar expressões artísticas."],
    example: { prompt: "Uma fotografia de uma manifestação usa enquadramento fechado e cartazes em primeiro plano. O que investigar?", solution: "Observe como o enquadramento direciona a atenção, quais vozes aparecem e como texto e imagem constroem uma perspectiva." },
    commonMistakes: ["Tratar interpretação como opinião sem evidência visual.", "Reduzir cultura a artes consagradas ou a um conjunto fixo de costumes."],
    resources: resources({ label: "Arte · Toda Matéria", url: "https://www.todamateria.com.br/arte/" }, "leitura de imagens e arte brasileira ENEM", "arte e cultura"),
  },
  {
    slug: "espanhol-interpretacao", title: "Leitura estratégica em espanhol", subject: "Espanhol", area: "Linguagens",
    summary: "A leitura em espanhol combina cognatos, contexto e atenção a diferenças lexicais. O objetivo é compreender a mensagem e a intenção do texto.",
    keyPoints: ["Use cognatos como pistas e confirme o sentido pelo contexto.", "Falsos cognatos como embarazada e oficina podem alterar a interpretação.", "Observe conectores, pronomes, título e fonte.", "A questão normalmente exige localizar evidências e reconhecer a finalidade do texto."],
    example: { prompt: "Em espanhol, 'actualmente' costuma indicar passado ou presente?", solution: "Indica 'atualmente', ou seja, o momento presente. O contexto confirma o sentido." },
    commonMistakes: ["Assumir que palavras parecidas têm sempre o mesmo significado.", "Parar a leitura em uma palavra desconhecida mesmo quando o contexto esclarece a ideia."],
    resources: resources({ label: "Língua espanhola · Toda Matéria", url: "https://www.todamateria.com.br/lingua-espanhola/" }, "interpretação em espanhol ENEM", "leitura em espanhol"),
  },
  {
    slug: "revolucao-industrial", title: "Revolução Industrial e transformações sociais", subject: "História", area: "Ciências Humanas",
    summary: "A industrialização alterou produção, trabalho, urbanização e relações sociais. O processo ocorreu em etapas e com ritmos diferentes entre regiões do mundo.",
    keyPoints: ["A mecanização ampliou a produção fabril e transformou ofícios.", "A urbanização acompanhou a concentração de empregos e serviços.", "Novas relações de trabalho também geraram conflitos e formas de organização coletiva.", "Analise tecnologia junto de propriedade, trabalho, ambiente e desigualdade."],
    example: { prompt: "Por que a mecanização não deve ser explicada apenas como aumento da produção?", solution: "Porque ela reorganizou o tempo de trabalho, a disciplina fabril, a vida urbana, a distribuição de renda e os conflitos entre grupos sociais." },
    commonMistakes: ["Supor que a industrialização aconteceu ao mesmo tempo em todos os países.", "Explicar mudanças históricas por uma única causa tecnológica."],
    resources: resources({ label: "Revolução Industrial · Toda Matéria", url: "https://www.todamateria.com.br/revolucao-industrial/" }, "revolução industrial · História ENEM"),
  },
  {
    slug: "urbanizacao-brasileira", title: "Urbanização e desigualdade socioespacial", subject: "Geografia", area: "Ciências Humanas",
    summary: "Urbanização envolve o crescimento da população urbana e a expansão das cidades. No Brasil, ocorreu de modo acelerado e desigual, articulada à industrialização e às migrações.",
    keyPoints: ["Cidade e campo são espaços conectados por fluxos de pessoas, mercadorias e informação.", "Segregação socioespacial distribui desigualmente infraestrutura e oportunidades.", "Mobilidade, moradia, saneamento e acesso a serviços ajudam a analisar a vida urbana.", "Mapas temáticos revelam padrões, mas dependem da escala e dos dados escolhidos."],
    example: { prompt: "Como relacionar longos deslocamentos casa-trabalho à organização urbana?", solution: "Eles podem indicar concentração de empregos em certas áreas, moradia periférica, custo da terra e desigualdade de acesso ao transporte." },
    commonMistakes: ["Usar urbanização como sinônimo de crescimento de uma única cidade.", "Tratar problemas urbanos sem relacioná-los à produção do espaço."],
    resources: resources({ label: "Urbanização brasileira · Toda Matéria", url: "https://www.todamateria.com.br/urbanizacao-brasileira/" }, "urbanização brasileira · Geografia ENEM"),
  },
  {
    slug: "cidadania-democracia", title: "Cidadania e democracia", subject: "Sociologia", area: "Ciências Humanas",
    summary: "Cidadania reúne direitos e responsabilidades construídos historicamente. Democracia envolve participação, representação, pluralismo e proteção de direitos.",
    keyPoints: ["Direitos civis, políticos e sociais têm trajetórias e garantias diferentes.", "A participação política também ocorre fora das eleições.", "Instituições e movimentos sociais podem ampliar ou restringir direitos.", "A análise exige identificar quem tem acesso efetivo às garantias formais."],
    example: { prompt: "Uma lei garante acesso a um serviço, mas parte da população não consegue utilizá-lo. O que investigar?", solution: "É preciso observar barreiras econômicas, geográficas, comunicacionais e institucionais entre o direito previsto e seu exercício concreto." },
    commonMistakes: ["Reduzir cidadania ao voto.", "Confundir igualdade perante a lei com igualdade de condições."],
    resources: resources({ label: "Cidadania · Toda Matéria", url: "https://www.todamateria.com.br/cidadania/" }, "cidadania e democracia · Sociologia ENEM"),
  },
  {
    slug: "cartografia-escalas", title: "Cartografia: escala e orientação", subject: "Geografia", area: "Ciências Humanas",
    summary: "Mapas são representações seletivas do espaço. Escala, legenda, orientação e projeção influenciam o que é possível observar.",
    keyPoints: ["Escala numérica 1:n indica que 1 unidade no mapa corresponde a n unidades reais.", "Em escala grande, uma área menor aparece com mais detalhe.", "Toda projeção plana produz alguma distorção.", "Leia título, legenda, orientação, escala e fonte antes de interpretar."],
    example: { prompt: "Em um mapa na escala 1:100.000, 2 cm representam quantos quilômetros?", solution: "2 cm × 100.000 = 200.000 cm. Como 100.000 cm = 1 km, a distância real é 2 km." },
    commonMistakes: ["Confundir escala grande com uma área grande representada.", "Converter centímetros diretamente para quilômetros sem conferir as unidades."],
    formula: "distância real = distância no mapa × denominador da escala",
    resources: resources({ label: "Cartografia · Toda Matéria", url: "https://www.todamateria.com.br/cartografia/" }, "escala cartográfica ENEM", "cartografia escala"),
  },
  {
    slug: "biomas-brasileiros", title: "Biomas brasileiros e conservação", subject: "Geografia", area: "Ciências Humanas",
    summary: "Os biomas reúnem conjuntos de ecossistemas com clima, vegetação e dinâmicas próprias. Conservação depende de compreender também usos do território e modos de vida locais.",
    keyPoints: ["Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa apresentam grande diversidade.", "Desmatamento, queimadas, fragmentação e mudanças climáticas afetam cada bioma de modos distintos.", "Indicadores e mapas precisam ser interpretados no tempo e na escala adequados.", "Conservação pode combinar áreas protegidas, fiscalização, ciência e participação comunitária."],
    example: { prompt: "Por que uma política única de conservação pode falhar em biomas diferentes?", solution: "Os biomas têm regimes climáticos, espécies, pressões econômicas e populações distintos; a política deve considerar os processos e comunidades de cada território." },
    commonMistakes: ["Tratar bioma como sinônimo de uma única formação vegetal.", "Ignorar comunidades tradicionais ao discutir conservação."],
    resources: resources({ label: "Biomas brasileiros · IBGE Educa", url: "https://educa.ibge.gov.br/jovens/conheca-o-brasil/territorio/18307-biomas-brasileiros.html" }, "biomas brasileiros ENEM", "biomas brasileiros"),
  },
  {
    slug: "filosofia-etica", title: "Ética, moral e vida coletiva", subject: "Filosofia", area: "Ciências Humanas",
    summary: "A ética investiga princípios e justificativas para agir; a moral reúne normas e valores praticados em contextos sociais. A distinção ajuda a examinar dilemas sem respostas automáticas.",
    keyPoints: ["Diferencie descrição de costumes e avaliação de justificativas.", "Dilemas podem envolver deveres, consequências, virtudes e direitos.", "Contextualizar uma ideia filosófica não significa que todas as opiniões sejam equivalentes.", "Reconstrua o argumento antes de criticá-lo."],
    example: { prompt: "Uma decisão beneficia a maioria, mas prejudica gravemente um grupo. Que perguntas éticas cabem?", solution: "Investigue consequências, direitos envolvidos, distribuição dos danos e se a regra poderia ser justificada a todos os afetados." },
    commonMistakes: ["Usar ética e moral como termos sempre idênticos.", "Atribuir a um filósofo uma frase sem compreender seu argumento."],
    resources: resources({ label: "Ética · Toda Matéria", url: "https://www.todamateria.com.br/etica/" }, "ética e moral · Filosofia ENEM"),
  },
  {
    slug: "redacao-estrutura-enem", title: "Estrutura da redação do ENEM", subject: "Redação", area: "Redação",
    summary: "A redação é um texto dissertativo-argumentativo sobre um problema social. O estudante apresenta uma tese, sustenta argumentos e propõe intervenção relacionada ao tema.",
    keyPoints: ["Introdução: contextualize o recorte e declare a tese.", "Desenvolvimento: cada parágrafo deve defender uma ideia com explicação e evidência.", "Conclusão: retome o problema e detalhe uma proposta viável e respeitosa aos direitos humanos.", "Revise aderência ao tema, progressão das ideias, coesão e norma escrita."],
    example: { prompt: "Como transformar 'a desinformação é ruim' em uma tese argumentável?", solution: "Delimite o problema e uma causa: 'A circulação de desinformação entre jovens é ampliada pela baixa formação midiática e pela recomendação algorítmica de conteúdos'. Os parágrafos podem desenvolver cada eixo." },
    commonMistakes: ["Apresentar repertório sem explicar sua relação com a tese.", "Listar uma solução genérica sem agente, ação, meio e finalidade.", "Fugir do recorte específico do tema."],
    visual: "argument", resources: [
      { label: "Cartilha da Redação do ENEM 2026 · INEP", url: "https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/enem/enem-2026-cartilha-da-redacao-esta-disponivel", kind: "oficial" },
      { label: "Matriz e documentos oficiais do ENEM · INEP", url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos", kind: "oficial" },
      { label: "Videoaulas: estrutura da redação ENEM", url: videoSearch("estrutura redação ENEM Toda Matéria"), kind: "videoaula" },
    ],
  },
  {
    slug: "redacao-proposta-intervencao", title: "Proposta de intervenção completa", subject: "Redação", area: "Redação",
    summary: "Uma intervenção bem desenvolvida responde ao problema discutido e deixa claros os responsáveis, o que será feito, como e para quê. A proposta deve respeitar direitos humanos.",
    keyPoints: ["Agente: quem pode executar a medida?", "Ação: o que será feito concretamente?", "Meio: por qual instrumento ou estratégia?", "Finalidade: qual resultado se busca? Detalhe pode explicar etapas ou público atendido."],
    example: { prompt: "Tema de treino: descarte inadequado de resíduos eletrônicos.", solution: "Uma possibilidade autoral: secretarias municipais de meio ambiente, em parceria com escolas, podem organizar pontos de coleta itinerantes e campanhas de orientação nos bairros, com divulgação em rádios locais, para facilitar o descarte seguro e ampliar a reciclagem." },
    commonMistakes: ["Usar 'o governo' sem especificar órgão ou responsabilidade.", "Propor punição ou restrição que viole direitos.", "Apresentar proposta desconectada da causa argumentada."],
    resources: [
      { label: "Competência V: orientações oficiais · INEP", url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos", kind: "oficial" },
      { label: "Videoaulas: proposta de intervenção ENEM", url: videoSearch("proposta de intervenção ENEM competência 5"), kind: "videoaula" },
    ],
  },


  {
    slug: "termodinamica",
    title: "Termodinâmica e calor",
    subject: "Física",
    area: "Ciências da Natureza",
    summary: "Termodinâmica estuda as relações entre calor, trabalho, temperatura e energia. Leis fundamentais regulam transformações energéticas.",
    keyPoints: [
      "Energia pode ser transformada, mas não criada nem destruída (1ª lei).",
      "Processos espontâneos tendem a aumentar a entropia (2ª lei).",
      "Não é possível atingir o zero absoluto em um número finito de etapas (3ª lei).",
      "Calor flui espontaneamente do corpo mais quente para o mais frio.",
      "Trabalho mecânico e calor são formas de transferência de energia.",
    ],
    example: {
      prompt: "Um gás recebe 150 J de calor e realiza 90 J de trabalho. Qual a variação da energia interna?",
      solution: "ΔU = Q − W = 150 − 90 = 60 J.",
    },
    commonMistakes: [
      "Confundir calor (transferência) com temperatura.",
      "Esquecer sinais: trabalho realizado pelo sistema é positivo no sentido W=pΔV, mas na convenção Q-W precisa de cuidado.",
      "Aplicar 1ª lei sem identificar sistema e vizinhança.",
    ],
    formula: "ΔU = Q − W | W = p · ΔV",
    visual: "energy",
    resources: resources({ label: "Termodinâmica · Toda Matéria", url: "https://www.todamateria.com.br/termodinamica/" }, "termodinâmica ENEM Física"),
  },
  {
    slug: "ondulatória",
    title: "Ondas, som e luz",
    subject: "Física",
    area: "Ciências da Natureza",
    summary: "Ondas transportam energia sem transportar matéria. Podem ser mecânicas ou eletromagnéticas, transversais ou longitudinais.",
    keyPoints: [
      "Reflexão, refração, difração, interferência e polarização são fenômenos ondulatórios.",
      "A velocidade de propagação depende do meio.",
      "Comprimento de onda (λ), frequência (f), velocidade (v): v = λf.",
      "Som é onda mecânica longitudinal; luz é onda eletromagnética transversal.",
      "Eco e reverberação relacionam-se ao tempo de reflexão.",
    ],
    example: {
      prompt: "Uma onda tem frequência 60 Hz e comprimento 2 m. Qual sua velocidade?",
      solution: "v = λ·f = 2·60 = 120 m/s.",
    },
    commonMistakes: [
      "Confundir frequência com velocidade.",
      "Pensar que som 'anda' no vácuo.",
      "Misturar interferência construtiva/destrutiva.",
    ],
    formula: "v = λ · f | T = 1/f",
    visual: "energy",
    resources: resources({ label: "Ondulatória · Toda Matéria", url: "https://www.todamateria.com.br/ondulatoria/" }, "ondas e som ENEM"),
  },

  {
    slug: "historio-grafia-brasil",
    title: "Brasil República: processos e desafios",
    subject: "História",
    area: "Ciências Humanas",
    summary: "O período republicano brasileiro apresenta rupturas, continuidades, movimentos sociais e transformações políticas e econômicas.",
    keyPoints: [
      "República Velha, Era Vargas, Período Populista, Ditadura Militar e Nova República são marcos.",
      "Movimentos sociais questionaram exclusões e ampliaram demandas por direitos.",
      "Industrialização, urbanização e migrações reconfiguraram o território.",
      "Memória e historiografia analisam interpretações distintas sobre o passado.",
    ],
    example: {
      prompt: "Como movimentos sociais contribuíram para ampliar direitos no Brasil republicano?",
      solution: "Eles pressionaram o poder público, construíram organizações coletivas e ajudaram a incluir demandas antes ignoradas na agenda política.",
    },
    commonMistakes: [
      "Reduzir períodos históricos a datas isoladas.",
      "Explicar mudanças apenas por lideranças individuais.",
      "Confundir ruptura total com transformação processual.",
    ],
    resources: resources({ label: "Brasil República · Toda Matéria", url: "https://www.todamateria.com.br/brasil-republica/" }, "Brasil República História ENEM"),
  },
  {
    slug: "geopolítica-global",
    title: "Globalização e geopolítica contemporânea",
    subject: "Geografia",
    area: "Ciências Humanas",
    summary: "Globalização integra fluxos, reorganiza territórios e produz desigualdades espaciais. Blocos, conflitos e desafios ambientais moldam a geopolítica atual.",
    keyPoints: [
      "Fluxos econômicos, informacionais, migratórios e culturais são seletivos.",
      "Regionalização e blocos econômicos reordenam relações internacionais.",
      "Conflitos, recursos naturais e mudanças climáticas geram tensões geopolíticas.",
      "Escalas (local/regional/global) ajudam a explicar problemas complexos.",
    ],
    example: {
      prompt: "Por que a globalização não é uniforme em todos os territórios?",
      solution: "Infraestrutura, inserção produtiva, políticas públicas e posição geográfica condicionam a integração aos fluxos globais.",
    },
    commonMistakes: [
      "Tomar globalização como homogênea.",
      "Ignorar resistências e alternativas locais.",
      "Confundir integração com igualdade entre regiões.",
    ],
    resources: resources({ label: "Globalização · Toda Matéria", url: "https://www.todamateria.com.br/globalizacao/" }, "globalização e geopolítica ENEM"),
  },

  {
    slug: "eletroquimica",
    title: "Eletroquímica: pilhas e eletrólise",
    subject: "Química",
    area: "Ciências da Natureza",
    summary: "Eletroquímica estuda reações de oxirredução que geram ou consomem corrente elétrica, fundamentais em baterias e processos industriais.",
    keyPoints: [
      "Oxidação = perda de elétrons; redução = ganho de elétrons.",
      "Ânodo é o polo onde ocorre oxidação; cátodo onde ocorre redução.",
      "Em pilhas, energia química vira elétrica. Em eletrólise, elétrica vira química.",
      "Potencial-padrão ajuda a prever espontaneidade.",
      "Leis de Faraday relacionam carga elétrica e massa depositada.",
    ],
    example: {
      prompt: "Em uma pilha, qual polo sofre oxidação e qual sofre redução?",
      solution: "Ânodo sofre oxidação (perde elétrons). Cátodo sofre redução (ganha elétrons).",
    },
    commonMistakes: [
      "Inverter ânodo/cátodo entre pilha e eletrólise sem raciocinar.",
      "Confundir sentido dos elétrons com sentido convencional da corrente.",
      "Equacionar sem balancear carga e elementos.",
    ],
    formula: "Q = i · t | 1 F = 96500 C/mol e⁻",
    resources: resources({ label: "Eletroquímica · Toda Matéria", url: "https://www.todamateria.com.br/eletroquimica/" }, "pilhas e eletrólise ENEM"),
  },
  {
    slug: "citologia",
    title: "Citologia: organelas e membrana celular",
    subject: "Biologia",
    area: "Ciências da Natureza",
    summary: "Células são unidades estruturais e funcionais dos seres vivos. Membranas regulam trocas e organelas desempenham funções especializadas.",
    keyPoints: [
      "Membrana plasmática: bicamada lipídica + proteínas (mosaico fluido).",
      "Transporte passivo (difusão, osmose) e ativo (gasta ATP).",
      "Organelas: mitocôndrias (respiração), ribossomos (síntese proteica), retículos, complexo golgiense, lisossomos.",
      "Células procariontes x eucariontes: diferenças estruturais.",
      "Núcleo coordena atividades e abriga material genético.",
    ],
    example: {
      prompt: "Em meio hipertônico, o que ocorre com uma célula animal?",
      solution: "Perde água por osmose e murcha (plasmólise/crenação).",
    },
    commonMistakes: [
      "Confundir difusão facilitada com transporte ativo.",
      "Achar que cloroplastos existem em todas as células vegetais sem distinção.",
      "Descrever osmose como 'passagem de soluto'.",
    ],
    resources: resources({ label: "Citologia · Toda Matéria", url: "https://www.todamateria.com.br/citologia/" }, "célula e organelas ENEM"),
  },

  {
    slug: "texto-dissertativo",
    title: "Texto dissertativo-argumentativo: tese e argumentos",
    subject: "Redação",
    area: "Redação",
    summary: "O texto dissertativo-argumentativo do ENEM defende um ponto de vista sobre problema social, com tese clara, argumentos e proposta de intervenção.",
    keyPoints: [
      "Tese: ideia central defendida, com recorte preciso do tema.",
      "Argumentos: explicação, exemplificação e relação com a tese.",
      "Progressão argumentativa: cada parágrafo amplia e justifica.",
      "Proposta de intervenção: agente, ação, meio, finalidade, respeitando direitos humanos.",
      "Repertório: deve ser desenvolvido e conectado ao argumento.",
    ],
    example: {
      prompt: "Como transformar uma afirmação genérica em tese argumentável?",
      solution: "Especifique o recorte e a causa: delimite quem é afetado, por quê e em que contexto, evitando generalizações.",
    },
    commonMistakes: [
      "Fugir do recorte temático.",
      "Listar argumentos sem explicar o 'porquê'.",
      "Apresentar proposta genérica (apenas 'o governo deve agir').",
      "Repetir ideias entre parágrafos.",
    ],
    resources: [
      { label: "Cartilha da Redação do ENEM · INEP", url: "https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/enem/enem-2026-cartilha-da-redacao-esta-disponivel", kind: "oficial" },
      { label: "Videoaulas: redação dissertativo-argumentativa", url: "https://www.youtube.com/results?search_query=redacao+dissertativo+argumentativo+enem+toda+materia", kind: "videoaula" },
    ],
  },

  {
    slug: "genetica-basica",
    title: "Genética: Mendel e hereditariedade",
    subject: "Biologia",
    area: "Ciências da Natureza",
    summary: "A genética estuda a transmissão de características hereditárias, leis de Mendel, dominância e probabilidade em cruzamentos.",
    keyPoints: [
      "Alelos: formas alternativas de um gene.",
      "Genótipo (composição) x fenótipo (característica observada).",
      "1ª lei: segregação dos fatores. 2ª lei: segregação independente.",
      "Dominância completa, incompleta e codominância.",
      "Probabilidade aplicada a cruzamentos (quadro de Punnett).",
    ],
    example: {
      prompt: "Em cruzamento Aa x Aa, qual proporção fenotípica esperada (dominância completa)?",
      solution: "3 dominantes : 1 recessivo.",
    },
    commonMistakes: [
      "Confundir genótipo com fenótipo.",
      "Usar 2ª lei quando genes estão ligados sem atenção.",
      "Calcular proporção sem identificar dominância correta.",
    ],
    resources: resources({ label: "Genética · Toda Matéria", url: "https://www.todamateria.com.br/genetica/" }, "genética Mendel ENEM"),
  },
  {
    slug: "quimica-organica-intro",
    title: "Química orgânica: hidrocarbonetos e funções",
    subject: "Química",
    area: "Ciências da Natureza",
    summary: "Química orgânica estuda compostos à base de carbono. Hidrocarbonetos e grupos funcionais determinam propriedades e reações.",
    keyPoints: [
      "Carbono forma 4 ligações e cadeias diversas.",
      "Hidrocarbonetos: alcanos, alcenos, alcinos, aromáticos.",
      "Funções orgânicas: álcool, éter, cetona, aldeído, ácido carboxílico, éster.",
      "Isomeria: estrutural, geométrica, óptica (noções básicas).",
      "Reações típicas: adição, substituição, combustão.",
    ],
    example: {
      prompt: "Qual a diferença entre alcano e alceno?",
      solution: "Alcano tem apenas ligações simples (saturado); alceno tem pelo menos uma dupla ligação (insaturado).",
    },
    commonMistakes: [
      "Confundir saturação/insaturação.",
      "Nomear errado pela cadeia principal.",
      "Igualar reatividade sem considerar grupo funcional.",
    ],
    resources: resources({ label: "Química orgânica · Toda Matéria", url: "https://www.todamateria.com.br/quimica-organica/" }, "química orgânica ENEM"),
  },
  {
    slug: "probabilidade-basica",
    title: "Probabilidade e contagem",
    subject: "Matemática",
    area: "Matemática",
    summary: "A probabilidade quantifica a chance de um evento em um conjunto de resultados possíveis. Problemas de contagem exigem identificar se a ordem importa e se há reposição.",
    keyPoints: [
      "Em resultados equiprováveis, P(A) = casos favoráveis ÷ casos possíveis.",
      "O evento complementar tem probabilidade 1 − P(A).",
      "A multiplicação de etapas pressupõe que as possibilidades de cada etapa foram contadas corretamente.",
      "Sem reposição, a quantidade de resultados disponíveis muda a cada retirada.",
    ],
    example: {
      prompt: "Uma caixa contém 3 fichas vermelhas e 2 azuis. Ao retirar uma ficha ao acaso, qual é a probabilidade de ela ser vermelha?",
      solution: "Há 5 fichas equiprováveis e 3 favoráveis. Logo, P(vermelha) = 3/5 = 60%.",
    },
    commonMistakes: [
      "Usar casos favoráveis sobre casos desfavoráveis, em vez do total de casos possíveis.",
      "Tratar retiradas sem reposição como eventos independentes.",
    ],
    formula: "P(A) = casos favoráveis / casos possíveis",
    resources: resources({ label: "Probabilidade · Toda Matéria", url: "https://www.todamateria.com.br/probabilidade/" }, "probabilidade e análise combinatória ENEM"),
  },
  {
    slug: "matematica-financeira-juros-compostos",
    title: "Juros compostos e crescimento percentual",
    subject: "Matemática",
    area: "Matemática",
    summary: "Nos juros compostos, cada período incide sobre o saldo atualizado. O modelo também descreve outros crescimentos percentuais sucessivos, desde que a taxa e o intervalo sejam constantes.",
    keyPoints: [
      "O saldo cresce por um fator multiplicativo em cada período.",
      "A taxa deve ser escrita na forma decimal e compatível com o período.",
      "Aumentos percentuais sucessivos não são somados: cada um incide sobre o novo saldo.",
      "Compare prazo e taxa antes de interpretar a evolução de um valor.",
    ],
    example: {
      prompt: "Um capital de R$ 2.000 cresce 10% ao mês por dois meses, sem depósitos ou retiradas. Qual é o montante?",
      solution: "M = 2.000 × 1,10² = R$ 2.420. No segundo mês, os 10% incidem sobre R$ 2.200.",
    },
    commonMistakes: [
      "Somar 10% + 10% e calcular ambos sobre o capital inicial.",
      "Misturar taxa mensal com prazo anual sem converter as unidades.",
    ],
    formula: "M = C × (1 + i)ⁿ",
    resources: resources({ label: "Juros compostos · Toda Matéria", url: "https://www.todamateria.com.br/juros-compostos/" }, "juros compostos ENEM"),
  },
  {
    slug: "consumo-energia-eletrica",
    title: "Potência e consumo de energia elétrica",
    subject: "Física",
    area: "Ciências da Natureza",
    summary: "O consumo de energia de um aparelho depende de sua potência e do tempo de funcionamento. A leitura de etiquetas e contas envolve conversões entre watts, quilowatts e quilowatt-hora.",
    keyPoints: [
      "Energia consumida = potência × tempo de uso.",
      "1 kW corresponde a 1.000 W; a conta residencial costuma expressar energia em kWh.",
      "Para comparar aparelhos, considere potência e tempo de utilização.",
      "O valor da conta também depende da tarifa e de cobranças locais.",
    ],
    example: {
      prompt: "Um aparelho de 1.500 W funciona 4 horas por dia durante 20 dias. Qual é seu consumo nesse período?",
      solution: "1.500 W = 1,5 kW. Então E = 1,5 × 4 × 20 = 120 kWh.",
    },
    commonMistakes: [
      "Informar o resultado em kW quando a pergunta pede energia em kWh.",
      "Esquecer de converter watts para quilowatts antes de calcular o consumo.",
    ],
    formula: "E (kWh) = P (kW) × t (h)",
    resources: resources({ label: "Energia elétrica · Toda Matéria", url: "https://www.todamateria.com.br/energia-eletrica/" }, "potência elétrica e consumo de energia ENEM"),
  },
  {
    slug: "estequiometria-basica",
    title: "Estequiometria e proporções químicas",
    subject: "Química",
    area: "Ciências da Natureza",
    summary: "A estequiometria usa os coeficientes de uma equação química balanceada para relacionar quantidades de reagentes e produtos. A conservação dos átomos orienta o balanceamento.",
    keyPoints: [
      "Balanceie a equação antes de estabelecer proporções entre substâncias.",
      "Coeficientes representam proporções em quantidade de matéria, não diretamente em massa.",
      "A massa molar converte massa em quantidade de matéria.",
      "Em problemas com mais de um reagente, identifique se algum está em excesso.",
    ],
    example: {
      prompt: "Na reação 2 H₂ + O₂ → 2 H₂O, quantos mols de O₂ reagem com 4 mols de H₂?",
      solution: "A proporção é 2 mol de H₂ para 1 mol de O₂. Portanto, 4 mol de H₂ reagem com 2 mol de O₂.",
    },
    commonMistakes: [
      "Usar uma equação ainda não balanceada.",
      "Confundir razão entre mols com razão entre massas.",
    ],
    formula: "n = m / M  |  use os coeficientes da equação balanceada",
    resources: resources({ label: "Estequiometria · Toda Matéria", url: "https://www.todamateria.com.br/estequiometria/" }, "estequiometria exercícios ENEM"),
  },
  {
    slug: "bioacumulacao-biomagnificacao",
    title: "Bioacumulação e biomagnificação",
    subject: "Biologia",
    area: "Ciências da Natureza",
    summary: "Alguns contaminantes persistentes acumulam-se nos organismos e podem atingir concentrações maiores em níveis tróficos mais altos. O efeito depende das propriedades da substância e das relações alimentares.",
    keyPoints: [
      "Bioacumulação é o aumento da concentração de uma substância em um organismo ao longo do tempo.",
      "Biomagnificação é o aumento da concentração ao longo de uma cadeia alimentar.",
      "Contaminantes persistentes e pouco eliminados podem ser transferidos pela alimentação.",
      "Diagramas de cadeias tróficas ajudam a interpretar quem está exposto e em que nível.",
    ],
    example: {
      prompt: "Por que um predador de topo pode apresentar concentração elevada de um contaminante persistente?",
      solution: "Ao alimentar-se de várias presas contaminadas, pode acumular a substância que foi transferida pelos níveis tróficos anteriores.",
    },
    commonMistakes: [
      "Usar bioacumulação e biomagnificação como sinônimos.",
      "Supor que todo contaminante aumenta de concentração em qualquer cadeia alimentar.",
    ],
    resources: resources({ label: "Cadeia alimentar · Toda Matéria", url: "https://www.todamateria.com.br/cadeia-alimentar/" }, "bioacumulação e biomagnificação ENEM"),
  },
  {
    slug: "generos-textuais-contexto",
    title: "Gêneros textuais, finalidade e contexto",
    subject: "Língua Portuguesa",
    area: "Linguagens",
    summary: "Gêneros textuais são formas de comunicação ligadas a situações sociais. Para interpretar um texto, observe quem fala, para quem, com qual finalidade e em que meio ele circula.",
    keyPoints: [
      "Gênero textual relaciona forma, propósito comunicativo e contexto de circulação.",
      "Um mesmo tema pode aparecer em notícia, campanha, crônica, artigo ou postagem.",
      "Elementos verbais e visuais podem trabalhar juntos para produzir sentido.",
      "A escolha de linguagem varia conforme público, suporte e objetivo.",
    ],
    example: {
      prompt: "Uma campanha pública usa um slogan curto, imagem de impacto e endereço de serviço. Que finalidade é mais provável?",
      solution: "A combinação busca chamar atenção, orientar o público e facilitar uma ação relacionada ao serviço divulgado.",
    },
    commonMistakes: [
      "Identificar o gênero apenas pela aparência, sem considerar a finalidade.",
      "Interpretar imagem e texto verbal separadamente quando produzem sentido em conjunto.",
    ],
    resources: resources({ label: "Gêneros textuais · Toda Matéria", url: "https://www.todamateria.com.br/generos-textuais/" }, "gêneros textuais interpretação ENEM"),
  },
];


export const studyContents = [...coreStudyContents, ...additionalStudyContents].map((content) => {
  if (content.resources?.some((resource) => resource.url.includes("wikipedia.org"))) {
    return content;
  }

  const wikiQuery = `${content.subject} ${content.title}`;
  return {
    ...content,
    resources: [
      ...(content.resources ?? []),
      {
        label: `Wikipédia · pesquisar ${content.title}`,
        url: `https://pt.wikipedia.org/w/index.php?search=${encodeURIComponent(wikiQuery)}`,
        kind: "leitura" as const,
      },
    ],
  };
});

export function getStudyContent(slug: string) {
  return studyContents.find((content) => content.slug === slug);
}
