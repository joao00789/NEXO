-- Adiciona novos temas com fundos animados sem alterar compras existentes.
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
        'crystal'
    ));

insert into public.site_themes (id, name, description, price)
values
    ('ocean', 'Oceano profundo', 'Azul abissal com ondas luminosas em movimento no fundo.', 220),
    ('sakura', 'Jardim Sakura', 'Rosas suaves com pétalas luminosas flutuando discretamente.', 240),
    ('cyber', 'Cyber grid', 'Grade tecnológica com brilho verde e movimento sutil.', 260),
    ('volcano', 'Vulcão', 'Brasa e calor em tons escuros de vermelho e laranja.', 280),
    ('crystal', 'Cristal', 'Reflexos azuis e violetas com um feixe de luz em movimento.', 240)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    is_active = true;
