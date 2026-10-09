-- Lote complementar de questões originais do NEXO, em formato de prática ENEM.
-- As questões oficiais de anos anteriores permanecem no acervo público do INEP.
do $migration$
declare
    v_question record;
    v_subject_id uuid;
    v_topic_id uuid;
    v_subtopic_id uuid;
    v_question_id uuid;
    v_subject_area text;
    v_columns text[];
    v_values text[];
    v_sql text;
begin
    for v_question in
        select * from (values
            (
                'nexo-extra-mat-probabilidade-01', 'matematica', 'Matemática', 'matematica', 'Probabilidade', 'probabilidade', 'evento-complementar', 'medio',
                'Uma caixa contém 4 cartões vermelhos, 3 azuis e 3 verdes. Um cartão é retirado ao acaso. Qual é a probabilidade de não ser azul?',
                'Há 10 cartões no total e 7 não são azuis. A probabilidade é 7/10, ou 70%.',
                '[{"label":"A","content":"30%","correct":false},{"label":"B","content":"40%","correct":false},{"label":"C","content":"70%","correct":true},{"label":"D","content":"90%","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-mat-proporcao-01', 'matematica', 'Matemática', 'matematica', 'Razão e proporção', 'razao-e-proporcao', 'consumo-proporcional', 'facil',
                'Uma torneira fornece 18 litros de água em 3 minutos, mantendo vazão constante. Quantos litros fornece em 8 minutos?',
                'A vazão é 18 ÷ 3 = 6 litros por minuto. Em 8 minutos, fornece 6 × 8 = 48 litros.',
                '[{"label":"A","content":"24 litros","correct":false},{"label":"B","content":"42 litros","correct":false},{"label":"C","content":"48 litros","correct":true},{"label":"D","content":"54 litros","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-mat-estatistica-01', 'matematica', 'Matemática', 'matematica', 'Estatística: média e mediana', 'estatistica-media-mediana', 'mediana', 'medio',
                'Os tempos, em minutos, de cinco trajetos foram 12, 15, 18, 20 e 45. Qual medida representa o valor central da lista ordenada?',
                'A mediana é o valor que ocupa a posição central após ordenar os dados. O terceiro valor é 18 minutos.',
                '[{"label":"A","content":"15 minutos","correct":false},{"label":"B","content":"18 minutos","correct":true},{"label":"C","content":"20 minutos","correct":false},{"label":"D","content":"22 minutos","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-ling-texto-01', 'linguagens', 'Língua Portuguesa', 'lingua-portuguesa', 'Gêneros textuais', 'generos-textuais', 'finalidade-comunicativa', 'medio',
                'Um cartaz informa horários de vacinação, faixa etária atendida e endereço dos postos. Qual é sua finalidade principal?',
                'As informações práticas orientam o público sobre quando, quem e onde pode acessar a vacinação.',
                '[{"label":"A","content":"Narrar uma experiência pessoal de vacinação.","correct":false},{"label":"B","content":"Orientar o público sobre o acesso a um serviço.","correct":true},{"label":"C","content":"Defender uma tese sobre a história da medicina.","correct":false},{"label":"D","content":"Entreter por meio de uma narrativa ficcional.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-ling-ingles-01', 'linguagens', 'Inglês', 'ingles', 'Estratégias de leitura em inglês', 'leitura-em-ingles', 'instrucao-publica', 'facil',
                'Leia a mensagem original: “The library is closed on Sunday. Return your books by Saturday.” O que o leitor deve fazer?',
                'A mensagem informa que a biblioteca fecha no domingo e solicita que os livros sejam devolvidos até sábado.',
                '[{"label":"A","content":"Devolver os livros até sábado.","correct":true},{"label":"B","content":"Visitar a biblioteca no domingo.","correct":false},{"label":"C","content":"Guardar os livros por mais uma semana.","correct":false},{"label":"D","content":"Abrir a biblioteca no sábado.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-ling-espanhol-01', 'linguagens', 'Espanhol', 'espanhol', 'Leitura estratégica em espanhol', 'espanhol-interpretacao', 'ideia-principal', 'facil',
                'Leia o aviso original: “Separa los residuos y deposita cada material en el contenedor indicado”. Qual orientação ele apresenta?',
                'O aviso pede que os resíduos sejam separados e colocados no recipiente correspondente a cada material.',
                '[{"label":"A","content":"Misturar todos os resíduos no mesmo recipiente.","correct":false},{"label":"B","content":"Separar os resíduos e usar o coletor adequado.","correct":true},{"label":"C","content":"Guardar os recipientes sem identificar o material.","correct":false},{"label":"D","content":"Evitar a coleta seletiva.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-humanas-historia-01', 'humanas', 'História', 'historia', 'Industrialização e trabalho', 'revolucao-industrial', 'tempo-de-trabalho', 'medio',
                'Em uma fábrica, o início e o fim da jornada passam a ser definidos por relógios e sirenes, substituindo ritmos de trabalho mais flexíveis. Que transformação isso evidencia?',
                'A organização fabril submeteu a rotina de muitos trabalhadores a horários e ritmos definidos pela produção mecanizada.',
                '[{"label":"A","content":"A perda de importância do trabalho assalariado.","correct":false},{"label":"B","content":"A disciplina do tempo de trabalho pela produção industrial.","correct":true},{"label":"C","content":"O fim da divisão de tarefas nas fábricas.","correct":false},{"label":"D","content":"A substituição das máquinas por atividades domésticas.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-humanas-geografia-01', 'humanas', 'Geografia', 'geografia', 'Urbanização e mobilidade', 'urbanizacao-brasileira', 'mobilidade-urbana', 'medio',
                'Uma cidade amplia linhas de ônibus entre bairros periféricos e áreas com hospitais e empregos. Qual aspecto do espaço urbano a medida procura enfrentar?',
                'A ampliação do transporte coletivo pode reduzir barreiras de deslocamento e facilitar o acesso a serviços e oportunidades.',
                '[{"label":"A","content":"A desigualdade de acesso à mobilidade e aos serviços urbanos.","correct":true},{"label":"B","content":"A necessidade de eliminar todos os espaços públicos.","correct":false},{"label":"C","content":"A redução da circulação de pessoas entre bairros.","correct":false},{"label":"D","content":"A substituição do planejamento por expansão sem infraestrutura.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-humanas-sociologia-01', 'humanas', 'Sociologia', 'sociologia', 'Cidadania e direitos sociais', 'cidadania-democracia', 'acesso-a-direitos', 'medio',
                'Um direito está previsto em lei, mas moradores de uma região distante não conseguem acessar o serviço correspondente. Qual análise sociológica é mais adequada?',
                'A existência formal do direito não garante, por si só, acesso efetivo; é preciso observar barreiras territoriais e institucionais.',
                '[{"label":"A","content":"Concluir que o direito é exercido igualmente por todos.","correct":false},{"label":"B","content":"Investigar as barreiras que separam a garantia legal do acesso real.","correct":true},{"label":"C","content":"Afirmar que distância e infraestrutura não afetam a cidadania.","correct":false},{"label":"D","content":"Considerar que serviços públicos devem atender apenas áreas centrais.","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-natureza-fisica-01', 'natureza', 'Física', 'fisica', 'Potência e consumo de energia elétrica', 'consumo-energia-eletrica', 'quilowatt-hora', 'facil',
                'Uma lâmpada de 60 W permanece acesa por 5 horas por dia durante 10 dias. Qual energia ela consome nesse período?',
                '60 W = 0,06 kW. O tempo total é 50 h. Logo, E = 0,06 × 50 = 3 kWh.',
                '[{"label":"A","content":"0,3 kWh","correct":false},{"label":"B","content":"3 kWh","correct":true},{"label":"C","content":"30 kWh","correct":false},{"label":"D","content":"300 kWh","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-natureza-quimica-01', 'natureza', 'Química', 'quimica', 'Concentração de soluções', 'solucoes-quimicas', 'concentracao-comum', 'medio',
                'Uma solução foi preparada dissolvendo 12 g de sal em água até completar 0,6 L. Qual é a concentração comum em g/L?',
                'A concentração comum é massa do soluto dividida pelo volume da solução: 12 ÷ 0,6 = 20 g/L.',
                '[{"label":"A","content":"7,2 g/L","correct":false},{"label":"B","content":"12 g/L","correct":false},{"label":"C","content":"20 g/L","correct":true},{"label":"D","content":"72 g/L","correct":false}]'::jsonb
            ),
            (
                'nexo-extra-natureza-biologia-01', 'natureza', 'Biologia', 'biologia', 'Ecologia e relações alimentares', 'ecologia-cadeias-alimentares', 'fluxo-de-energia', 'medio',
                'Em uma cadeia alimentar, parte da energia é usada pelos organismos em suas atividades e dissipada como calor. O que tende a ocorrer com a energia disponível nos níveis tróficos seguintes?',
                'A energia disponível tende a diminuir ao longo das transferências, pois parte é utilizada e dissipada em cada nível.',
                '[{"label":"A","content":"Aumenta integralmente em cada transferência.","correct":false},{"label":"B","content":"Permanece idêntica em todos os níveis.","correct":false},{"label":"C","content":"Diminui a cada transferência entre níveis tróficos.","correct":true},{"label":"D","content":"É criada pelos consumidores sem entrada de energia.","correct":false}]'::jsonb
            )
        ) as seed(slug, area, subject_name, subject_slug, topic_name, topic_slug, subtopic_slug, difficulty, statement, explanation, options)
    loop
        v_subject_id := null;
        v_topic_id := null;
        v_subtopic_id := null;
        v_question_id := null;
        v_subject_area := case v_question.area
            when 'matematica' then 'Matemática'
            when 'linguagens' then 'Linguagens'
            when 'humanas' then 'Ciências Humanas'
            when 'natureza' then 'Ciências da Natureza'
        end;

        if to_regclass('public.subjects') is not null
           and to_regclass('public.topics') is not null
           and to_regclass('public.subtopics') is not null then
            execute 'select id from public.subjects where slug = $1 limit 1'
                into v_subject_id using v_question.subject_slug;
            if v_subject_id is null then
                if exists (select 1 from information_schema.columns where table_schema='public' and table_name='subjects' and column_name='area') then
                    execute 'insert into public.subjects (name, slug, area) values ($1, $2, $3) returning id'
                        into v_subject_id using v_question.subject_name, v_question.subject_slug, v_subject_area;
                else
                    execute 'insert into public.subjects (name, slug) values ($1, $2) returning id'
                        into v_subject_id using v_question.subject_name, v_question.subject_slug;
                end if;
            end if;

            execute 'select id from public.topics where subject_id = $1 and slug = $2 limit 1'
                into v_topic_id using v_subject_id, v_question.topic_slug;
            if v_topic_id is null then
                execute 'insert into public.topics (subject_id, name, slug) values ($1, $2, $3) returning id'
                    into v_topic_id using v_subject_id, v_question.topic_name, v_question.topic_slug;
            end if;

            execute 'select id from public.subtopics where topic_id = $1 and slug = $2 limit 1'
                into v_subtopic_id using v_topic_id, v_question.subtopic_slug;
            if v_subtopic_id is null then
                execute 'insert into public.subtopics (topic_id, name, slug) values ($1, $2, $3) returning id'
                    into v_subtopic_id using v_topic_id, v_question.topic_name, v_question.subtopic_slug;
            end if;
        end if;

        v_columns := array[
            'id', 'slug', 'area', 'subject', 'topic', 'difficulty', 'statement',
            'explanation', 'source', 'origin', 'status'
        ];
        v_values := array[
            quote_literal(gen_random_uuid()::text), quote_literal(v_question.slug),
            quote_literal(v_question.area), quote_literal(v_question.subject_name),
            quote_literal(v_question.topic_name), quote_literal(v_question.difficulty),
            quote_literal(v_question.statement), quote_literal(v_question.explanation),
            quote_literal('Questão autoral NEXO · estilo ENEM'), quote_literal('manual'), quote_literal('approved')
        ];

        if v_subject_id is not null and exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='subject_id') then
            v_columns := array_append(v_columns, 'subject_id'); v_values := array_append(v_values, quote_literal(v_subject_id::text));
        end if;
        if v_topic_id is not null and exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='topic_id') then
            v_columns := array_append(v_columns, 'topic_id'); v_values := array_append(v_values, quote_literal(v_topic_id::text));
        end if;
        if v_subtopic_id is not null and exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='subtopic_id') then
            v_columns := array_append(v_columns, 'subtopic_id'); v_values := array_append(v_values, quote_literal(v_subtopic_id::text));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='question_type') then
            v_columns := array_append(v_columns, 'question_type'); v_values := array_append(v_values, quote_literal('multiple_choice'));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='options') then
            v_columns := array_append(v_columns, 'options'); v_values := array_append(v_values, quote_literal(v_question.options::text) || '::jsonb');
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='correct_answer') then
            v_columns := array_append(v_columns, 'correct_answer');
            v_values := array_append(v_values, quote_literal((select item->>'label' from jsonb_array_elements(v_question.options) item where item->>'correct' = 'true' limit 1)));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='source_label') then
            v_columns := array_append(v_columns, 'source_label'); v_values := array_append(v_values, quote_literal('Questão autoral NEXO · estilo ENEM'));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='is_official') then
            v_columns := array_append(v_columns, 'is_official'); v_values := array_append(v_values, 'false');
        end if;

        v_sql := format(
            'insert into public.questions (%s) values (%s) on conflict (slug) do nothing returning id',
            array_to_string(v_columns, ', '),
            array_to_string(v_values, ', ')
        );
        execute v_sql into v_question_id;
        if v_question_id is null then
            select id into v_question_id from public.questions where slug = v_question.slug;
        end if;

        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='question_options' and column_name='position') then
            execute $options$
                insert into public.question_options (question_id, label, content, is_correct, position)
                select $1, item->>'label', item->>'content', (item->>'correct')::boolean, ordinal::integer
                from jsonb_array_elements($2) with ordinality as entries(item, ordinal)
                where not exists (
                    select 1 from public.question_options existing
                    where existing.question_id = $1 and existing.label = item->>'label'
                )
            $options$ using v_question_id, v_question.options;
        else
            execute $options$
                insert into public.question_options (question_id, label, content, is_correct)
                select $1, item->>'label', item->>'content', (item->>'correct')::boolean
                from jsonb_array_elements($2) as entries(item)
                where not exists (
                    select 1 from public.question_options existing
                    where existing.question_id = $1 and existing.label = item->>'label'
                )
            $options$ using v_question_id, v_question.options;
        end if;
    end loop;
end;
$migration$;
