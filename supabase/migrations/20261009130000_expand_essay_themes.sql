-- Mais temas de redação autorais e referência a oficiais
insert into public.essay_themes (id, title, category, motivation, source_label, source_url, is_official)
values
  ('nexo-ia-etica', 'Desafios éticos do uso de inteligência artificial na educação brasileira', 'tecnologia', 'Considere impactos na aprendizagem, na autoria, na privacidade e na equidade educacional.', 'Tema autoral NEXO', null, false),
  ('nexo-mobilidade', 'Caminhos para uma mobilidade urbana sustentável no Brasil', 'ambiental', 'Reflita sobre transporte, ocupação do solo, poluição e inclusão.', 'Tema autoral NEXO', null, false),
  ('nexo-saude-mental', 'Saúde mental de adolescentes no contexto escolar brasileiro', 'social', 'Analise fatores de risco, acolhimento, prevenção e políticas públicas.', 'Tema autoral NEXO', null, false),
  ('nexo-alfabetizacao', 'Desafios para a alfabetização e letramento no Brasil', 'educacao', 'Considere a importância da leitura crítica e da equidade no acesso ao conhecimento.', 'Tema autoral NEXO', null, false),
  ('nexo-patrimonio', 'Preservação do patrimônio histórico e cultural brasileiro', 'cultura', 'Discuta proteção, valorização e participação comunitária.', 'Tema autoral NEXO', null, false)
on conflict (id) do nothing;

insert into public.essay_themes(id, title, category, motivation, source_label, source_url, is_official)
values
  ('enem-2022-regular', 'Desafios para a efetivação da cidadania no Brasil', 'cidadania', 'Referência para treino retrospectivo com base em edições anteriores do ENEM.', 'ENEM 2022 · INEP', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem', true)
on conflict (id) do nothing;
