-- Lote inicial de questões autorais NEXO para as treze matérias do ENEM.
-- Compatível com o schema textual e com o catálogo normalizado
-- (subjects/topics/subtopics) encontrado em instalações existentes.
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
                'nexo-mat-porcentagem-01', 'matematica', 'Matemática', 'matematica', 'Porcentagem', 'porcentagem', 'desconto-percentual', 'facil',
                'Uma mochila custava R$ 250 e recebeu desconto de 20%. Qual passou a ser o preço?',
                'O desconto é 0,20 × 250 = R$ 50. O preço final é 250 − 50 = R$ 200.',
                '[{"label":"A","content":"R$ 180","correct":false},{"label":"B","content":"R$ 200","correct":true},{"label":"C","content":"R$ 210","correct":false},{"label":"D","content":"R$ 230","correct":false}]'::jsonb
            ),
            (
                'nexo-mat-proporcao-01', 'matematica', 'Matemática', 'matematica', 'Razão e proporção', 'razao-e-proporcao', 'regra-de-tres', 'facil',
                'Uma receita para 4 pessoas usa 300 g de farinha. Mantendo a proporção, quantos gramas são necessários para 10 pessoas?',
                'A quantidade por pessoa é 300 ÷ 4 = 75 g. Para 10 pessoas: 75 × 10 = 750 g.',
                '[{"label":"A","content":"600 g","correct":false},{"label":"B","content":"700 g","correct":false},{"label":"C","content":"750 g","correct":true},{"label":"D","content":"900 g","correct":false}]'::jsonb
            ),
            (
                'nexo-mat-geometria-01', 'matematica', 'Matemática', 'matematica', 'Geometria plana', 'geometria-plana', 'areas', 'medio',
                'Uma placa triangular tem base de 12 cm e altura de 7 cm. Qual é sua área?',
                'A área do triângulo é base × altura ÷ 2: 12 × 7 ÷ 2 = 42 cm².',
                '[{"label":"A","content":"19 cm²","correct":false},{"label":"B","content":"42 cm²","correct":true},{"label":"C","content":"84 cm²","correct":false},{"label":"D","content":"96 cm²","correct":false}]'::jsonb
            ),
            (
                'nexo-port-interpretacao-01', 'linguagens', 'Língua Portuguesa', 'lingua-portuguesa', 'Interpretação de texto', 'interpretacao-de-texto', 'inferencias', 'medio',
                'Uma campanha mostra um rio coberto por resíduos e traz a frase “O descarte de hoje é a água de amanhã”. Qual relação a campanha sugere?',
                'A frase relaciona o descarte atual à qualidade futura da água, usando uma consequência para alertar o público.',
                '[{"label":"A","content":"O descarte não altera os rios.","correct":false},{"label":"B","content":"A poluição atual pode comprometer a água no futuro.","correct":true},{"label":"C","content":"A água se renova sem impacto humano.","correct":false},{"label":"D","content":"A campanha trata apenas de consumo doméstico.","correct":false}]'::jsonb
            ),
            (
                'nexo-lit-modernismo-01', 'linguagens', 'Literatura', 'literatura', 'Modernismo brasileiro', 'modernismo-brasileiro', 'primeira-fase', 'medio',
                'Uma obra modernista emprega fala cotidiana, humor e referências brasileiras para questionar modelos artísticos importados. Qual procedimento aparece com mais força?',
                'A combinação de linguagem cotidiana, humor e referências locais expressa experimentação e crítica a modelos consagrados, traços associados ao projeto modernista.',
                '[{"label":"A","content":"Imitação rígida de padrões clássicos europeus.","correct":false},{"label":"B","content":"Ruptura estética e valorização de elementos locais.","correct":true},{"label":"C","content":"Abandono de qualquer experimentação formal.","correct":false},{"label":"D","content":"Uso exclusivo de temas mitológicos antigos.","correct":false}]'::jsonb
            ),
            (
                'nexo-ing-reading-01', 'linguagens', 'Inglês', 'ingles', 'Estratégias de leitura em inglês', 'leitura-em-ingles', 'finalidade-textual', 'facil',
                'Leia o aviso: “Bring your reusable bottle. Refill stations are available on every floor.” Qual orientação está sendo dada?',
                'O aviso pede que a pessoa leve uma garrafa reutilizável e informa que há pontos para reabastecê-la em todos os andares.',
                '[{"label":"A","content":"Comprar água em cada andar.","correct":false},{"label":"B","content":"Levar garrafa reutilizável e usar os pontos de abastecimento.","correct":true},{"label":"C","content":"Evitar os andares do prédio.","correct":false},{"label":"D","content":"Descartar garrafas em qualquer local.","correct":false}]'::jsonb
            ),
            (
                'nexo-es-reading-01', 'linguagens', 'Espanhol', 'espanhol', 'Leitura estratégica em espanhol', 'espanhol-interpretacao', 'falsos-cognatos', 'facil',
                'Em um texto em espanhol, lê-se: “El lunes asistiré a una conferencia en la biblioteca”. Nesse contexto, o que significa “asistiré”?',
                '“Asistir” significa comparecer ou estar presente. A frase diz que a pessoa irá a uma conferência na biblioteca.',
                '[{"label":"A","content":"Ajudarei a organizar a conferência.","correct":false},{"label":"B","content":"Estarei presente na conferência.","correct":true},{"label":"C","content":"Assinarei um documento na biblioteca.","correct":false},{"label":"D","content":"Cancelarei a conferência.","correct":false}]'::jsonb
            ),
            (
                'nexo-arts-image-01', 'linguagens', 'Artes', 'artes', 'Arte, cultura e leitura de imagens', 'arte-e-cultura', 'leitura-de-imagem', 'medio',
                'Em uma fotografia, o enquadramento destaca trabalhadores ao fundo e uma máquina em primeiro plano. Para interpretar a imagem, qual procedimento é mais adequado?',
                'A leitura deve relacionar escolhas formais, como enquadramento e foco, ao contexto e ao sentido produzido, sem atribuir um significado automático.',
                '[{"label":"A","content":"Ignorar a composição e analisar somente o título.","correct":false},{"label":"B","content":"Relacionar enquadramento, elementos visuais e contexto de circulação.","correct":true},{"label":"C","content":"Presumir que toda fotografia é neutra.","correct":false},{"label":"D","content":"Descrever as cores sem considerar a organização da imagem.","correct":false}]'::jsonb
            ),
            (
                'nexo-edfis-saude-01', 'linguagens', 'Educação Física', 'educacao-fisica', 'Corpo, saúde e práticas corporais', 'educacao-fisica-saude', 'atividade-fisica', 'facil',
                'Uma escola oferece caminhada, dança e jogos cooperativos em horários acessíveis a diferentes estudantes. Qual princípio está sendo favorecido?',
                'A variedade de práticas e a acessibilidade ampliam a participação e reconhecem diferentes interesses e condições corporais.',
                '[{"label":"A","content":"A seleção de estudantes pelo desempenho atlético.","correct":false},{"label":"B","content":"A participação inclusiva em práticas corporais diversas.","correct":true},{"label":"C","content":"A substituição de todas as atividades por competição.","correct":false},{"label":"D","content":"A restrição das práticas a uma única modalidade.","correct":false}]'::jsonb
            ),
            (
                'nexo-hist-industrial-01', 'humanas', 'História', 'historia', 'Revolução Industrial', 'revolucao-industrial', 'trabalho-fabril', 'medio',
                'Com a expansão das fábricas, muitos trabalhadores passaram a cumprir jornadas organizadas pelo ritmo das máquinas. Essa mudança indica principalmente:',
                'A produção fabril reorganizou o tempo e a disciplina do trabalho, subordinando parte das atividades ao ritmo das máquinas.',
                '[{"label":"A","content":"O fim imediato do trabalho assalariado.","correct":false},{"label":"B","content":"A reorganização do trabalho e do controle do tempo.","correct":true},{"label":"C","content":"O retorno generalizado à produção artesanal doméstica.","correct":false},{"label":"D","content":"A ausência de conflitos nas relações de trabalho.","correct":false}]'::jsonb
            ),
            (
                'nexo-geo-cartografia-01', 'humanas', 'Geografia', 'geografia', 'Cartografia: escala e orientação', 'cartografia-escalas', 'escala-cartografica', 'medio',
                'Em um mapa de escala 1:50.000, uma avenida mede 4 cm. Qual é a distância real representada?',
                '4 × 50.000 = 200.000 cm. Como 100.000 cm correspondem a 1 km, a distância é 2 km.',
                '[{"label":"A","content":"200 m","correct":false},{"label":"B","content":"2 km","correct":true},{"label":"C","content":"20 km","correct":false},{"label":"D","content":"200 km","correct":false}]'::jsonb
            ),
            (
                'nexo-soc-cidadania-01', 'humanas', 'Sociologia', 'sociologia', 'Cidadania e democracia', 'cidadania-democracia', 'direitos-sociais', 'medio',
                'Um direito está previsto em lei, mas moradores de uma região não conseguem acessar o serviço público correspondente. A situação evidencia a diferença entre:',
                'A garantia formal de um direito não assegura, por si só, condições concretas para exercê-lo; barreiras de acesso precisam ser investigadas.',
                '[{"label":"A","content":"Direito formal e acesso efetivo.","correct":true},{"label":"B","content":"Democracia e existência de eleições.","correct":false},{"label":"C","content":"Cidadania e nacionalidade apenas.","correct":false},{"label":"D","content":"Lei escrita e ausência de instituições.","correct":false}]'::jsonb
            ),
            (
                'nexo-filo-etica-01', 'humanas', 'Filosofia', 'filosofia', 'Ética, moral e vida coletiva', 'filosofia-etica', 'dilemas-eticos', 'medio',
                'Uma política aumenta o benefício coletivo, mas impõe danos graves a um grupo vulnerável. Qual análise ética é mais completa?',
                'Uma análise cuidadosa considera consequências, direitos, distribuição de danos e a possibilidade de justificar a decisão às pessoas afetadas.',
                '[{"label":"A","content":"Contar apenas o número de beneficiados.","correct":false},{"label":"B","content":"Examinar consequências, direitos e distribuição dos impactos.","correct":true},{"label":"C","content":"Ignorar quem sofre os danos.","correct":false},{"label":"D","content":"Aceitar a decisão porque toda maioria está sempre correta.","correct":false}]'::jsonb
            ),
            (
                'nexo-bio-ecologia-01', 'natureza', 'Biologia', 'biologia', 'Ecologia e relações alimentares', 'ecologia-cadeias-alimentares', 'cadeias-alimentares', 'facil',
                'Em uma cadeia alimentar capim → gafanhoto → sapo, qual organismo é o produtor?',
                'O capim é produtor porque forma matéria orgânica usando energia luminosa; os demais organismos são consumidores.',
                '[{"label":"A","content":"Capim.","correct":true},{"label":"B","content":"Gafanhoto.","correct":false},{"label":"C","content":"Sapo.","correct":false},{"label":"D","content":"Todos são decompositores.","correct":false}]'::jsonb
            ),
            (
                'nexo-fis-velocidade-01', 'natureza', 'Física', 'fisica', 'Movimento e velocidade média', 'cinematica-velocidade', 'velocidade-media', 'facil',
                'Um ciclista percorre 36 km em 2 horas, mantendo o mesmo ritmo. Qual é sua velocidade média?',
                'A velocidade média é o deslocamento dividido pelo tempo: 36 ÷ 2 = 18 km/h.',
                '[{"label":"A","content":"12 km/h","correct":false},{"label":"B","content":"18 km/h","correct":true},{"label":"C","content":"36 km/h","correct":false},{"label":"D","content":"72 km/h","correct":false}]'::jsonb
            ),
            (
                'nexo-qui-misturas-01', 'natureza', 'Química', 'quimica', 'Misturas e separação de materiais', 'quimica-misturas-separacao', 'separacao-de-misturas', 'medio',
                'Uma amostra contém areia misturada à água. Qual método simples permite separar o sólido não dissolvido do líquido?',
                'Na filtração, o filtro retém as partículas sólidas e permite a passagem do líquido.',
                '[{"label":"A","content":"Filtração.","correct":true},{"label":"B","content":"Destilação fracionada obrigatoriamente.","correct":false},{"label":"C","content":"Fusão nuclear.","correct":false},{"label":"D","content":"Cromatografia gasosa.","correct":false}]'::jsonb
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
            quote_literal('Questão autoral NEXO'), quote_literal('manual'), quote_literal('approved')
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
            v_columns := array_append(v_columns, 'source_label'); v_values := array_append(v_values, quote_literal('Questão autoral NEXO'));
        end if;
        if exists (select 1 from information_schema.columns where table_schema='public' and table_name='questions' and column_name='is_official') then
            v_columns := array_append(v_columns, 'is_official'); v_values := array_append(v_values, 'false');
        end if;

        v_sql := format('insert into public.questions (%s) values (%s) on conflict (slug) do nothing returning id',
            array_to_string(v_columns, ', '), array_to_string(v_values, ', '));
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
