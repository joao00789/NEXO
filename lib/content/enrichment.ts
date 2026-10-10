import type { StudyContent } from "./catalog";
import { resources, videoSearch } from "./resources";

export const additionalStudyContents: StudyContent[] = [
  {
    slug: "progressoes-aritmeticas-geometricas",
    title: "Progressões aritméticas e geométricas",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "PA e PG descrevem sequências numéricas por padrões de variação. Reconhecer a razão permite encontrar termos e interpretar crescimento em contextos como economia e população.",
    keyPoints: [
      "Na PA, a diferença entre termos consecutivos é constante: aₙ = a₁ + (n − 1)r.",
      "Na PG, a razão entre termos consecutivos é constante: aₙ = a₁ · qⁿ⁻¹.",
      "A soma dos n primeiros termos da PA é Sₙ = n(a₁ + aₙ)/2.",
      "Crescimentos percentuais sucessivos costumam formar uma PG, não uma PA.",
    ],
    example: {
      prompt:
        "Uma arquibancada tem 12 lugares na primeira fileira e cada fileira seguinte tem 3 lugares a mais. Quantos lugares há na 8ª fileira?",
      solution:
        "É uma PA com a₁ = 12 e r = 3. Então a₈ = 12 + (8 − 1) · 3 = 33 lugares.",
    },
    commonMistakes: [
      "Confundir a razão aditiva da PA com a razão multiplicativa da PG.",
      "Usar n em vez de n − 1 na fórmula do termo geral.",
    ],
    formula: "PA: aₙ = a₁ + (n − 1)r  |  PG: aₙ = a₁ · qⁿ⁻¹",
    resources: resources(
      {
        label: "Progressão aritmética · Toda Matéria",
        url: "https://www.todamateria.com.br/progressao-aritmetica/",
      },
      "PA e PG exercícios ENEM",
      "progressão aritmética e geométrica",
    ),
  },
  {
    slug: "funcao-quadratica",
    title: "Função quadrática e parábolas",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "Funções quadráticas modelam situações com variação não linear. O gráfico é uma parábola, e seus zeros, vértice e concavidade ajudam a interpretar máximos, mínimos e intervalos.",
    keyPoints: [
      "A forma geral é f(x) = ax² + bx + c, com a diferente de zero.",
      "Se a > 0, a parábola tem concavidade para cima; se a < 0, para baixo.",
      "As raízes são os pontos em que o gráfico cruza o eixo x.",
      "O vértice indica o valor máximo ou mínimo da função.",
    ],
    example: {
      prompt:
        "A altura de um objeto é dada por h(t) = −t² + 6t. Em que instante a altura é máxima?",
      solution:
        "Como a = −1 e b = 6, a parábola abre para baixo. O instante do vértice é t = −b/(2a) = −6/(−2) = 3. A altura máxima ocorre em 3 unidades de tempo.",
    },
    commonMistakes: [
      "Confundir o instante do vértice com a altura máxima.",
      "Ignorar o sinal de a ao identificar máximo ou mínimo.",
    ],
    formula: "xᵥ = −b/(2a)  |  yᵥ = f(xᵥ)",
    resources: resources(
      {
        label: "Função quadrática · Toda Matéria",
        url: "https://www.todamateria.com.br/funcao-quadratica/",
      },
      "função quadrática e parábola ENEM",
    ),
  },
  {
    slug: "trigonometria-triangulo-retangulo",
    title: "Trigonometria no triângulo retângulo",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "Seno, cosseno e tangente relacionam ângulos agudos e lados de triângulos retângulos. O ENEM costuma contextualizar essas razões em alturas, distâncias e inclinações.",
    keyPoints: [
      "sen(θ) = cateto oposto/hipotenusa.",
      "cos(θ) = cateto adjacente/hipotenusa.",
      "tg(θ) = cateto oposto/cateto adjacente.",
      "Desenhe o triângulo e marque o ângulo de referência antes de escolher a razão.",
    ],
    example: {
      prompt:
        "Uma rampa forma um ângulo de 30° com o chão e tem 10 m de comprimento. Considerando sen(30°) = 0,5, qual é a altura atingida?",
      solution:
        "A rampa é a hipotenusa e a altura é o cateto oposto. sen(30°) = h/10 = 0,5; portanto h = 5 m.",
    },
    commonMistakes: [
      "Trocar cateto oposto e adjacente sem considerar o ângulo escolhido.",
      "Aplicar a razão trigonométrica a lados de um triângulo que não é retângulo.",
    ],
    formula:
      "sen = oposto/hipotenusa  |  cos = adjacente/hipotenusa  |  tg = oposto/adjacente",
    visual: "triangle",
    resources: resources(
      {
        label: "Trigonometria no triângulo retângulo · Toda Matéria",
        url: "https://www.todamateria.com.br/trigonometria-no-triangulo-retangulo/",
      },
      "trigonometria triângulo retângulo ENEM",
    ),
  },
  {
    slug: "analise-combinatoria",
    title: "Princípio multiplicativo e contagem",
    subject: "Matemática",
    area: "Matemática",
    summary:
      "A análise combinatória conta possibilidades sem listar uma por uma. A decisão central é verificar se a ordem importa e se há repetição.",
    keyPoints: [
      "Se uma etapa tem m opções e outra tem n, o princípio multiplicativo produz m · n combinações.",
      "Use fatorial em permutações quando todos os elementos distintos são ordenados.",
      "Combinações contam grupos em que a ordem não altera o resultado.",
      "Desenhos de árvore ajudam em situações pequenas a conferir a contagem.",
    ],
    example: {
      prompt:
        "Uma senha tem uma letra escolhida entre 4 e depois um algarismo entre 3, sem restrições. Quantas senhas existem?",
      solution:
        "Há 4 escolhas para a letra e 3 para o algarismo. Pelo princípio multiplicativo, 4 · 3 = 12 senhas.",
    },
    commonMistakes: [
      "Somar opções de etapas que acontecem em sequência, quando o caso pede multiplicação.",
      "Usar combinação quando trocar a ordem cria um resultado diferente.",
    ],
    formula: "Etapas independentes: total = n₁ · n₂ · ... · nₖ",
    resources: resources(
      {
        label: "Análise combinatória · Toda Matéria",
        url: "https://www.todamateria.com.br/analise-combinatoria/",
      },
      "princípio fundamental da contagem ENEM",
    ),
  },
  {
    slug: "coesao-coerencia-argumentacao",
    title: "Coesão, coerência e argumentação",
    subject: "Língua Portuguesa",
    area: "Linguagens",
    summary:
      "A coesão conecta partes do texto por recursos linguísticos; a coerência organiza sentidos compatíveis. Em questões do ENEM, observe como conectivos e escolhas lexicais orientam a leitura.",
    keyPoints: [
      "Conectivos indicam relações como causa, oposição, conclusão e condição.",
      "Pronomes e expressões referenciais retomam ou antecipam informações.",
      "Coerência depende da relação entre ideias e do contexto, não apenas de conectivos.",
      "A troca de um conectivo pode alterar o sentido do argumento.",
    ],
    example: {
      prompt:
        "Compare: “Choveu, portanto a partida foi adiada” e “Choveu, embora a partida tenha sido adiada”. O que muda?",
      solution:
        "“Portanto” apresenta o adiamento como consequência da chuva. “Embora” introduz uma concessão e cria outra relação lógica entre as ideias.",
    },
    commonMistakes: [
      "Escolher conectivos apenas para variar o vocabulário, sem preservar a relação lógica.",
      "Confundir repetição de conectivos com coerência argumentativa.",
    ],
    resources: resources(
      {
        label: "Coesão textual · Toda Matéria",
        url: "https://www.todamateria.com.br/coesao-e-coerencia/",
      },
      "coesão coerência conectivos ENEM",
    ),
  },
  {
    slug: "variacao-linguistica",
    title: "Variação linguística e preconceito linguístico",
    subject: "Língua Portuguesa",
    area: "Linguagens",
    summary:
      "A língua varia conforme região, situação, grupo e época. Compreender essa diversidade ajuda a interpretar textos e a reconhecer que adequação ao contexto é diferente de hierarquizar falantes.",
    keyPoints: [
      "Variações podem ser regionais, sociais, históricas ou situacionais.",
      "A norma-padrão é uma variedade valorizada em contextos formais, não a única forma legítima de comunicação.",
      "Adequação considera público, objetivo e situação comunicativa.",
      "Preconceito linguístico associa diferenças de fala a julgamentos injustos sobre pessoas.",
    ],
    example: {
      prompt:
        "Uma personagem usa marcas regionais de fala em um diálogo literário. Como interpretar esse recurso?",
      solution:
        "Observe o contexto, a construção da personagem e o efeito expressivo. A variedade pode marcar identidade e situação, sem ser tratada como erro por si só.",
    },
    commonMistakes: [
      "Tratar toda fala diferente da norma-padrão como falta de conhecimento.",
      "Ignorar o contexto social e literário ao analisar uma variedade.",
    ],
    resources: resources(
      {
        label: "Variação linguística · Toda Matéria",
        url: "https://www.todamateria.com.br/variacoes-linguisticas/",
      },
      "variação linguística ENEM",
    ),
  },
  {
    slug: "revolucao-francesa-iluminismo",
    title: "Iluminismo e Revolução Francesa",
    subject: "História",
    area: "Ciências Humanas",
    summary:
      "Ideias iluministas criticaram privilégios e formas de poder, mas sua relação com a Revolução Francesa precisa ser analisada junto a conflitos sociais, fiscais e políticos do período.",
    keyPoints: [
      "Pensadores iluministas defenderam diferentes ideias sobre razão, direitos e organização política.",
      "A crise do Antigo Regime envolveu desigualdades sociais, endividamento e disputas políticas.",
      "A Revolução Francesa atravessou fases e grupos com projetos distintos.",
      "Declarações de direitos coexistiram historicamente com exclusões e disputas por cidadania.",
    ],
    example: {
      prompt:
        "Por que a Revolução Francesa não pode ser explicada apenas pela divulgação de ideias iluministas?",
      solution:
        "As ideias circularam em uma sociedade marcada por desigualdades, crise fiscal e conflitos sobre representação e poder. A combinação desses fatores ajuda a explicar a ruptura.",
    },
    commonMistakes: [
      "Reduzir um processo histórico complexo a uma causa única.",
      "Supor que os direitos proclamados foram aplicados igualmente a todos desde o início.",
    ],
    resources: resources(
      {
        label: "Revolução Francesa · Toda Matéria",
        url: "https://www.todamateria.com.br/revolucao-francesa/",
      },
      "Iluminismo e Revolução Francesa ENEM",
    ),
  },
  {
    slug: "trabalho-industrial-e-globalizacao",
    title: "Trabalho, tecnologia e globalização",
    subject: "Geografia",
    area: "Ciências Humanas",
    summary:
      "Mudanças tecnológicas e reorganização produtiva alteram empregos e cadeias globais. A leitura crítica considera quem se beneficia, quem assume riscos e como as condições variam no território.",
    keyPoints: [
      "Cadeias produtivas podem distribuir etapas entre diferentes países e regiões.",
      "Automação transforma tarefas, mas seus efeitos dependem de políticas e condições locais.",
      "A informalidade e a precarização não são resultados inevitáveis da tecnologia.",
      "Mapas, gráficos e relatos ajudam a comparar escalas e grupos afetados.",
    ],
    example: {
      prompt:
        "Uma fábrica automatiza parte da produção e amplia a contratação de técnicos. Que conclusão é mais cuidadosa?",
      solution:
        "A tecnologia reorganizou tarefas e qualificações naquela unidade; para avaliar efeitos no emprego, é preciso observar o conjunto de postos, as condições de trabalho e o contexto local.",
    },
    commonMistakes: [
      "Afirmar que a tecnologia sempre elimina ou sempre cria empregos.",
      "Generalizar um caso local para todos os setores e regiões.",
    ],
    resources: resources(
      {
        label: "Globalização · Toda Matéria",
        url: "https://www.todamateria.com.br/globalizacao/",
      },
      "trabalho tecnologia globalização ENEM",
    ),
  },
  {
    slug: "clima-e-mudancas-climaticas",
    title: "Clima, efeito estufa e mudanças climáticas",
    subject: "Geografia",
    area: "Ciências Humanas",
    summary:
      "O efeito estufa natural mantém a Terra habitável; o aumento de gases por atividades humanas intensifica o aquecimento global. Interpretar evidências exige distinguir tempo atmosférico, clima e tendência.",
    keyPoints: [
      "Tempo atmosférico descreve condições de curto prazo; clima analisa padrões em períodos longos.",
      "O efeito estufa é natural, mas sua intensificação altera o balanço energético.",
      "Impactos e vulnerabilidades variam entre lugares e grupos sociais.",
      "Adaptação reduz danos; mitigação atua sobre as causas das emissões.",
    ],
    example: {
      prompt:
        "Uma semana fria em uma cidade prova que o aquecimento global não ocorre?",
      solution:
        "Não. Um episódio local de curto prazo é tempo atmosférico; mudanças climáticas são avaliadas por tendências de longo prazo e evidências em escalas amplas.",
    },
    commonMistakes: [
      "Usar uma ocorrência meteorológica isolada como prova de tendência climática.",
      "Confundir redução de impactos com eliminação das causas.",
    ],
    resources: resources(
      {
        label: "Mudanças climáticas · Wikipédia",
        url: "https://pt.wikipedia.org/wiki/Mudan%C3%A7a_do_clima",
      },
      "mudanças climáticas e efeito estufa ENEM",
      "mudanças climáticas",
    ),
  },
  {
    slug: "circuitos-eletricos-consumo",
    title: "Circuitos elétricos e consumo de energia",
    subject: "Física",
    area: "Ciências da Natureza",
    summary:
      "Circuitos relacionam tensão, corrente e resistência. Para estimar consumo residencial, combine potência e tempo de uso e interprete corretamente a unidade quilowatt-hora.",
    keyPoints: [
      "A Lei de Ohm relaciona tensão, corrente e resistência: U = R · i.",
      "Potência indica energia transferida por unidade de tempo.",
      "Energia elétrica consumida pode ser estimada por E = P · Δt.",
      "Converta watts para quilowatts e horas para a unidade solicitada.",
    ],
    example: {
      prompt:
        "Um aparelho de 1000 W funciona por 2 horas. Qual é o consumo aproximado?",
      solution: "1000 W = 1 kW. Então E = 1 kW · 2 h = 2 kWh.",
    },
    commonMistakes: [
      "Confundir potência (kW) com energia consumida (kWh).",
      "Esquecer de converter watts para quilowatts antes de calcular kWh.",
    ],
    formula: "U = R · i  |  E = P · Δt",
    visual: "energy",
    resources: resources(
      {
        label: "Circuitos elétricos · Toda Matéria",
        url: "https://www.todamateria.com.br/circuitos-eletricos/",
      },
      "consumo de energia elétrica ENEM",
    ),
  },
  {
    slug: "termoquimica-entalpia",
    title: "Termoquímica: calor e entalpia",
    subject: "Química",
    area: "Ciências da Natureza",
    summary:
      "A termoquímica analisa calor liberado ou absorvido em transformações. Sinais, quantidade de matéria e condições do sistema são essenciais para interpretar dados energéticos.",
    keyPoints: [
      "Processo exotérmico libera calor e tem ΔH < 0.",
      "Processo endotérmico absorve calor e tem ΔH > 0.",
      "A variação de entalpia depende dos estados inicial e final.",
      "Equações termoquímicas devem indicar proporções e condições a que se referem.",
    ],
    example: {
      prompt: "Uma reação apresenta ΔH = +45 kJ. Ela absorve ou libera calor?",
      solution:
        "Como ΔH é positivo, a entalpia dos produtos é maior que a dos reagentes; a reação absorve calor do meio e é endotérmica.",
    },
    commonMistakes: [
      "Associar sinal positivo a calor liberado.",
      "Esquecer que inverter a equação química também inverte o sinal de ΔH.",
    ],
    formula: "ΔH = Hprodutos − Hreagentes",
    resources: resources(
      {
        label: "Termoquímica · Toda Matéria",
        url: "https://www.todamateria.com.br/termoquimica/",
      },
      "termoquímica entalpia ENEM",
    ),
  },
  {
    slug: "evolucao-selecao-natural",
    title: "Evolução e seleção natural",
    subject: "Biologia",
    area: "Ciências da Natureza",
    summary:
      "A seleção natural modifica a frequência de características hereditárias em populações ao longo das gerações. Variação, hereditariedade e diferenças de sucesso reprodutivo são centrais.",
    keyPoints: [
      "A variação hereditária entre indivíduos é matéria-prima da evolução.",
      "Características podem se tornar mais frequentes quando aumentam o sucesso reprodutivo em certo ambiente.",
      "Indivíduos não evoluem por necessidade; populações mudam ao longo das gerações.",
      "Uma adaptação depende do ambiente e não representa uma escala de superioridade.",
    ],
    example: {
      prompt:
        "Após várias gerações, uma população de insetos apresenta maior proporção de indivíduos resistentes a um pesticida. Como explicar?",
      solution:
        "Se havia variação hereditária de resistência, o pesticida favoreceu a sobrevivência e reprodução dos resistentes. Com o tempo, a frequência dessa característica aumentou na população.",
    },
    commonMistakes: [
      "Dizer que os insetos ficaram resistentes porque precisavam se adaptar durante a vida.",
      "Confundir seleção natural com escolha consciente do organismo.",
    ],
    resources: resources(
      {
        label: "Seleção natural · Wikipédia",
        url: "https://pt.wikipedia.org/wiki/Sele%C3%A7%C3%A3o_natural",
      },
      "seleção natural evolução ENEM",
      "seleção natural",
    ),
  },
  {
    slug: "redacao-passo-a-passo",
    title: "Redação do ENEM: do tema à versão final",
    subject: "Redação",
    area: "Redação",
    summary:
      "Um roteiro de planejamento, escrita e revisão para construir um texto dissertativo-argumentativo autoral, responder ao recorte temático e apresentar uma intervenção detalhada que respeite os direitos humanos.",
    keyPoints: [
      "Leia o comando e os textos motivadores para delimitar o problema, sem copiá-los.",
      "Defina uma tese objetiva e dois eixos argumentativos que possam ser desenvolvidos.",
      "Organize introdução, dois parágrafos de desenvolvimento e conclusão como estrutura possível, não como fórmula obrigatória.",
      "Revise as cinco competências e a relação entre causas discutidas e intervenção proposta.",
    ],
    steps: [
      {
        title: "1. Entenda o recorte temático",
        description:
          "Reescreva o tema em uma pergunta-problema. Identifique o fenômeno, o grupo ou contexto delimitado e a tarefa pedida. Use os textos motivadores para compreender o assunto, mas não os copie.",
      },
      {
        title: "2. Planeje sua tese",
        description:
          "Responda à pergunta com um ponto de vista claro. Selecione duas causas, consequências ou obstáculos que você consiga explicar; eles serão os eixos dos parágrafos de desenvolvimento.",
      },
      {
        title: "3. Escreva a introdução",
        description:
          "Apresente uma contextualização pertinente, conecte-a ao problema específico e termine anunciando a tese. Repertório só ajuda quando é explicado e relacionado ao tema.",
      },
      {
        title: "4. Desenvolva o primeiro argumento",
        description:
          "Abra o parágrafo com uma ideia ligada à tese. Explique o mecanismo ou a causa, use exemplo ou repertório confiável e conclua mostrando como isso agrava ou mantém o problema.",
      },
      {
        title: "5. Desenvolva o segundo argumento",
        description:
          "Apresente um eixo diferente do primeiro. Desenvolva-o com explicação e evidência; evite repetir a mesma causa com outras palavras.",
      },
      {
        title: "6. Elabore a proposta de intervenção",
        description:
          "Defina agente responsável, ação concreta, meio de execução, finalidade e algum detalhamento. Verifique se a proposta responde a uma causa discutida e respeita os direitos humanos.",
      },
      {
        title: "7. Revise as cinco competências",
        description:
          "Confira a modalidade escrita formal; o atendimento ao tema e ao gênero; a seleção e organização dos argumentos; os mecanismos de coesão; e a intervenção detalhada. Use a cartilha oficial do INEP para conhecer os critérios vigentes.",
      },
    ],
    example: {
      prompt:
        "Tema de treino: desafios para ampliar a vacinação em comunidades de difícil acesso.",
      solution:
        "Planejamento possível: tese sobre barreiras de acesso e desinformação; desenvolvimento 1 sobre distância e horários dos serviços; desenvolvimento 2 sobre circulação de informações falsas; intervenção articulada com equipes móveis de saúde e comunicação acessível. É apenas um caminho autoral, não modelo único.",
    },
    commonMistakes: [
      "Usar uma introdução pronta que não responde ao recorte específico.",
      "Citar repertório sem explicar a relação com a ideia defendida.",
      "Apresentar dois parágrafos com o mesmo argumento.",
      "Propor apenas “conscientizar” sem dizer quem fará o quê, como e com qual finalidade.",
      "Acreditar que existe um número obrigatório de parágrafos ou uma estrutura única.",
    ],
    visual: "argument",
    resources: [
      {
        label: "Cartilha da Redação do ENEM · INEP",
        url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos",
        kind: "oficial",
      },
      {
        label: "Dissertação · Wikipédia (leitura complementar)",
        url: "https://pt.wikipedia.org/w/index.php?search=texto+dissertativo-argumentativo",
        kind: "leitura",
      },
      {
        label: "Videoaulas: redação ENEM passo a passo",
        url: videoSearch(
          "redação ENEM passo a passo planejamento tese argumentos intervenção",
        ),
        kind: "videoaula",
      },
    ],
  },
  {
    slug: "redacao-repertorio-sociocultural",
    title: "Repertório sociocultural produtivo na redação",
    subject: "Redação",
    area: "Redação",
    summary:
      "Repertório pode vir de livros, pesquisas, leis, acontecimentos ou conceitos, desde que seja pertinente, confiável e integrado ao raciocínio. A referência não substitui a explicação do argumento.",
    keyPoints: [
      "Escolha referências que você compreende e consegue relacionar ao recorte.",
      "Explique o que a referência demonstra antes de conectar à tese.",
      "Dados exigem fonte, contexto e interpretação; não use números decorados sem segurança.",
      "Uma argumentação bem explicada vale mais que uma lista de citações.",
    ],
    example: {
      prompt:
        "Como usar uma referência sobre acesso à educação sem deixá-la solta no parágrafo?",
      solution:
        "Apresente a referência, explique o que ela revela sobre desigualdade de acesso e conecte esse dado à causa defendida e ao grupo afetado.",
    },
    commonMistakes: [
      "Inserir nome de filósofo ou obra sem explicar sua ideia.",
      "Atribuir frases duvidosas a autores famosos.",
      "Usar repertório que tangencia o tema, mas não sustenta o argumento.",
    ],
    resources: [
      {
        label: "Cartilha da Redação do ENEM · INEP",
        url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos",
        kind: "oficial",
      },
      {
        label: "Argumentação · Wikipédia (leitura complementar)",
        url: "https://pt.wikipedia.org/w/index.php?search=argumenta%C3%A7%C3%A3o",
        kind: "leitura",
      },
    ],
  },
  {
    slug: "redacao-coesao-revisao",
    title: "Coesão e revisão final da redação",
    subject: "Redação",
    area: "Redação",
    summary:
      "A revisão final verifica se as partes do texto se conectam, se cada parágrafo avança a tese e se a escrita está clara. Conectivos precisam expressar relações lógicas reais.",
    keyPoints: [
      "Use referências e substituições para evitar repetições sem criar ambiguidades.",
      "Varie conectivos conforme a relação de sentido: causa, contraste, consequência ou conclusão.",
      "Leia cada parágrafo perguntando qual ideia nova ele acrescenta.",
      "Reserve tempo para revisar concordância, pontuação, ortografia e legibilidade.",
    ],
    example: {
      prompt:
        "Na revisão, dois parágrafos começam com “Além disso” e repetem a mesma causa. O que fazer?",
      solution:
        "Reorganize a argumentação para que cada parágrafo desenvolva um eixo diferente. Depois escolha conectivos que expressem a relação entre as ideias, em vez de apenas variar palavras.",
    },
    commonMistakes: [
      "Trocar conectivos por sinônimos que mudam a relação lógica.",
      "Revisar apenas ortografia e ignorar a progressão argumentativa.",
      "Acrescentar frases no fim sem verificar se respondem à tese.",
    ],
    resources: [
      {
        label: "Cartilha da Redação do ENEM · INEP",
        url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/outros-documentos",
        kind: "oficial",
      },
      {
        label: "Coesão textual · Wikipédia (leitura complementar)",
        url: "https://pt.wikipedia.org/w/index.php?search=coes%C3%A3o+textual",
        kind: "leitura",
      },
    ],
  },
];
