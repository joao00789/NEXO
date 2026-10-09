import type { Metadata } from "next";
import { z } from "zod";

import { ContentLibrary } from "@/components/content/content-library";
import { studyContents } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "Conteúdos" };

const searchSchema = z.string().trim().max(80).catch("");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = searchSchema.parse(rawQuery ?? "");
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const contents = normalizedQuery
    ? studyContents.filter((content) =>
        [
          content.title,
          content.subject,
          content.area,
          content.summary,
          content.formula ?? "",
          ...content.keyPoints,
          ...content.resources?.map((resource) => resource.label) ?? [],
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery),
      )
    : studyContents;

  return <ContentLibrary contents={contents} query={query} />;
}
