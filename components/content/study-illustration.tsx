import type { StudyContent } from "@/lib/content/catalog";
import type { ReactNode } from "react";

const diagrams = {
  percentage: {
    title: "Como visualizar um desconto de 20%",
    description: "Uma barra inteira representa cem por cento; a parte azul representa os oitenta por cento que restam.",
    content: (
      <>
        <rect x="24" y="40" width="352" height="44" rx="10" fill="currentColor" opacity=".12" />
        <rect x="24" y="40" width="281.6" height="44" rx="10" fill="currentColor" />
        <text x="24" y="112" className="fill-current text-[13px]">Preço original: 100%</text>
        <text x="24" y="145" className="fill-current text-[13px]">Após desconto: 80%</text>
        <text x="315" y="68" className="fill-current text-[12px]">−20%</text>
      </>
    ),
  },
  equation: {
    title: "Equilíbrio dos dois lados da equação",
    description: "Aplicamos a mesma operação nos dois lados para preservar a igualdade.",
    content: (
      <>
        <text x="24" y="46" className="fill-current text-[14px]">2x + 5 = 17</text>
        <path d="M42 62v20m0 0 82 0m-82 0 16-12m-16 12 16 12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M214 62v20m0 0 82 0m-82 0 16-12m-16 12 16 12" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="24" y="111" className="fill-current text-[13px]">−5</text>
        <text x="195" y="111" className="fill-current text-[13px]">−5</text>
        <text x="24" y="151" className="fill-current text-[14px]">2x = 12  →  x = 6</text>
      </>
    ),
  },
  triangle: {
    title: "Área do triângulo: metade do paralelogramo",
    description: "Dois triângulos iguais formam um paralelogramo de base b e altura h.",
    content: (
      <>
        <path d="M48 132 152 46l104 86Z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="2" />
        <path d="M48 132h208M152 46v86" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
        <text x="137" y="151" className="fill-current text-[13px]">base b</text>
        <text x="162" y="95" className="fill-current text-[13px]">h</text>
        <text x="275" y="96" className="fill-current text-[14px]">A = b × h/2</text>
      </>
    ),
  },
  cell: {
    title: "Fluxo simplificado em uma cadeia alimentar",
    description: "A energia passa do produtor para consumidores; as setas apontam no sentido da transferência.",
    content: (
      <>
        <rect x="12" y="66" width="94" height="46" rx="12" fill="currentColor" opacity=".15" />
        <rect x="153" y="66" width="94" height="46" rx="12" fill="currentColor" opacity=".22" />
        <rect x="294" y="66" width="94" height="46" rx="12" fill="currentColor" opacity=".3" />
        <text x="34" y="94" className="fill-current text-[12px]">Capim</text>
        <text x="173" y="94" className="fill-current text-[12px]">Gafanhoto</text>
        <text x="320" y="94" className="fill-current text-[12px]">Sapo</text>
        <path d="M110 89h34m-8-7 8 7-8 7m106-7h34m-8-7 8 7-8 7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="117" y="51" className="fill-current text-[10px]">energia</text>
        <text x="258" y="51" className="fill-current text-[10px]">energia</text>
      </>
    ),
  },
  energy: {
    title: "Velocidade média relaciona distância e tempo",
    description: "Divida o deslocamento pelo tempo decorrido e mantenha as unidades coerentes.",
    content: (
      <>
        <path d="M36 112h320" stroke="currentColor" strokeWidth="2" />
        <circle cx="54" cy="112" r="7" fill="currentColor" />
        <circle cx="332" cy="112" r="7" fill="currentColor" />
        <path d="M64 80h252m-10-8 10 8-10 8" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="38" y="145" className="fill-current text-[12px]">início</text>
        <text x="307" y="145" className="fill-current text-[12px]">chegada</text>
        <text x="106" y="54" className="fill-current text-[14px]">vₘ = deslocamento / tempo</text>
      </>
    ),
  },
  argument: {
    title: "Quatro partes para detalhar a intervenção",
    description: "A proposta responde ao problema e explicita agente, ação, meio e finalidade.",
    content: (
      <>
        {[
          ["Agente", "quem?"],
          ["Ação", "o quê?"],
          ["Meio", "como?"],
          ["Finalidade", "para quê?"],
        ].map(([heading, question], index) => {
          const x = 8 + index * 100;
          return (
            <g key={heading}>
              <rect x={x} y="52" width="90" height="72" rx="12" fill="currentColor" opacity={0.12 + index * 0.04} />
              <text x={x + 12} y="83" className="fill-current text-[11px]">{heading}</text>
              <text x={x + 12} y="105" className="fill-current text-[11px]" opacity=".7">{question}</text>
            </g>
          );
        })}
      </>
    ),
  },
  } satisfies Record<NonNullable<StudyContent["visual"]>, { title: string; description: string; content: ReactNode }>;

export function StudyIllustration({ visual }: { visual: StudyContent["visual"] }) {
  if (!visual) return null;
  const diagram = diagrams[visual];

  return (
    <figure className="bg-surface border-border rounded-xl border p-5">
      <figcaption className="mb-3">
        <p className="text-sm font-semibold">{diagram.title}</p>
        <p className="text-muted-foreground mt-1 text-xs">{diagram.description}</p>
      </figcaption>
      <svg viewBox="0 0 400 170" role="img" aria-label={`${diagram.title}. ${diagram.description}`} className="text-primary mx-auto block h-auto w-full max-w-xl">
        {diagram.content}
      </svg>
    </figure>
  );
}
