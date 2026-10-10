-- Adiciona temas de base preta com acentos e animações distintos.
alter table public.site_themes
    drop constraint if exists site_themes_id_check;

alter table public.site_themes
    add constraint site_themes_id_check
    check (id in (
        'aurora',
        'nebula',
        'sunrise',
        'ocean',
        'sakura',
        'cyber',
        'volcano',
        'crystal',
        'obsidian',
        'forest',
        'amethyst',
        'crimson',
        'black',
        'black-neon',
        'black-emerald',
        'black-rose'
    ));

insert into public.site_themes (id, name, description, price)
values
    ('black', 'Black', 'Preto profundo com um reflexo prateado que percorre o fundo.', 260),
    ('black-neon', 'Black Neon', 'Preto absoluto, grade ciano e brilho tecnológico em movimento.', 280),
    ('black-emerald', 'Black Emerald', 'Preto intenso com pontos de luz verde-esmeralda flutuando.', 280),
    ('black-rose', 'Black Rose', 'Preto noturno com pétalas rosa que atravessam a tela suavemente.', 300)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    is_active = true;
