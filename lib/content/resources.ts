import type { StudyContent } from "./catalog";

export const videoSearch = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} aula ENEM`)}`;

export const resources = (
  reading: { label: string; url: string },
  video: string,
  wikiQuery = reading.label.replace(/ · .*/, ""),
): StudyContent["resources"] => [
  { ...reading, kind: "leitura" },
  { label: `Videoaulas: ${video}`, url: videoSearch(video), kind: "videoaula" },
  {
    label: "Toda Matéria · conteúdos do ENEM",
    url: "https://www.todamateria.com.br/enem/materias/",
    kind: "leitura",
  },
  {
    label: `Wikipédia · pesquisar ${wikiQuery}`,
    url: `https://pt.wikipedia.org/w/index.php?search=${encodeURIComponent(wikiQuery)}`,
    kind: "leitura",
  },
];
