-- Disponibiliza no NEXO os 24 pets do pacote Cube Pets presente em public/avatar.
insert into public.animal_species(id, name, description, accent) values
 ('beaver', 'Castor', 'Constrói com persistência.', 'amber'),
 ('bee', 'Abelha', 'Atenta e trabalhadora.', 'amber'),
 ('bunny', 'Coelho', 'Ágil e curioso.', 'rose'),
 ('caterpillar', 'Lagarta', 'Sempre em evolução.', 'teal'),
 ('chick', 'Pintinho', 'Pequeno começo, grande jornada.', 'amber'),
 ('cow', 'Vaca', 'Calma e constante.', 'violet'),
 ('crab', 'Caranguejo', 'Firme em qualquer desafio.', 'rose'),
 ('deer', 'Cervo', 'Leve e atento.', 'teal'),
 ('dog', 'Cachorro', 'Leal e companheiro.', 'blue'),
 ('elephant', 'Elefante', 'Memória e determinação.', 'cyan'),
 ('fish', 'Peixe', 'Flui entre os desafios.', 'blue'),
 ('giraffe', 'Girafa', 'Enxerga longe e segue em frente.', 'amber'),
 ('hog', 'Javali', 'Corajoso e persistente.', 'rose'),
 ('koala', 'Coala', 'Tranquilo e focado.', 'teal'),
 ('lion', 'Leão', 'Confiante e determinado.', 'amber'),
 ('monkey', 'Macaco', 'Criativo e esperto.', 'violet'),
 ('panda', 'Panda', 'Equilíbrio e concentração.', 'cyan'),
 ('parrot', 'Papagaio', 'Comunicativo e expressivo.', 'rose'),
 ('penguin', 'Pinguim', 'Resistente e colaborativo.', 'blue'),
 ('pig', 'Porco', 'Curioso e persistente.', 'rose'),
 ('polar', 'Urso-polar', 'Resiliente nos desafios.', 'cyan'),
 ('tiger', 'Tigre', 'Foco e coragem.', 'amber')
on conflict (id) do update set name = excluded.name, description = excluded.description, accent = excluded.accent, is_active = true;

-- Converte as espécies temporárias da primeira versão para pets disponíveis nos assets.
update public.profiles set animal_id = case animal_id
 when 'owl' then 'panda'
 when 'turtle' then 'beaver'
 when 'wolf' then 'dog'
 when 'rabbit' then 'bunny'
 else animal_id end
where animal_id in ('owl', 'turtle', 'wolf', 'rabbit');

update public.animal_species set is_active = false where id in ('owl', 'turtle', 'wolf', 'rabbit');
