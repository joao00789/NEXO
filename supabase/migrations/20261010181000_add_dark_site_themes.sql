-- Adiciona quatro temas escuros com paletas e fundos animados próprios.
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
        'crimson'
    ));

insert into public.site_themes (id, name, description, price)
values
    ('obsidian', 'Obsidiana', 'Grafite profundo com reflexos prateados discretos.', 260),
    ('forest', 'Floresta noturna', 'Verde esmeralda escuro com luzes suaves em movimento.', 280),
    ('amethyst', 'Ametista', 'Violeta noturno com pontos de luz e brilho sutil.', 280),
    ('crimson', 'Carmesim', 'Tons escuros de vinho com reflexos rubi em movimento.', 300)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    is_active = true;
