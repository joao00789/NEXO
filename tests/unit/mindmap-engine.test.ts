import test from "node:test";
import assert from "node:assert";
import { treeToGraph } from "@/lib/mindmaps/engine";
import { createMindMapSchema } from "@/lib/mindmaps/schemas";

test("treeToGraph posiciona raiz, ramos e folhas em colunas", () => {
  const tree = {
    title: "Termodinâmica",
    summary: "Estuda calor, trabalho e energia.",
    branches: [
      {
        label: "1ª Lei",
        description: "Conservação de energia",
        children: [
          { label: "ΔU = Q − W", description: "Equação básica" },
          { label: "Sistema e vizinhança" },
        ],
      },
      {
        label: "2ª Lei",
        children: [{ label: "Entropia" }, { label: "Processos irreversíveis" }],
      },
    ],
  };

  const { nodes, edges } = treeToGraph(tree);
  const root = nodes.find((n) => n.data.kind === "root");
  const branches = nodes.filter((n) => n.data.kind === "branch");
  const leaves = nodes.filter((n) => n.data.kind === "leaf");

  assert.ok(root, "deve ter nó raiz");
  assert.equal(root?.data.label, "Termodinâmica");
  assert.equal(branches.length, 2);
  assert.equal(leaves.length, 4);
  assert.equal(edges.length, branches.length + leaves.length);
  assert.ok(edges.every((e) => e.source && e.target));
  assert.ok(branches.every((branch) => branch.position.x > (root?.position.x ?? 0)));
  assert.ok(leaves.every((leaf) => leaf.position.x > branches[0]!.position.x));
  assert.notEqual(leaves[0]!.position.y, leaves[1]!.position.y);
});

test("createMindMapSchema interpreta checkbox HTML ausente como IA desativada", () => {
  const parsed = createMindMapSchema.safeParse({
    contentSlug: "porcentagem",
    depth: "essencial",
    useAi: null,
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.useAi, false);
});

test("createMindMapSchema interpreta checkbox HTML marcado como IA ativada", () => {
  const parsed = createMindMapSchema.safeParse({
    contentSlug: "porcentagem",
    depth: "essencial",
    useAi: "on",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.useAi, true);
});
