import type { Edge, Node } from "@xyflow/react";
import { mindMapColors, type MindMapNodeData } from "@/lib/mindmaps/schemas";

export type MindMapGraph = { nodes: Node<MindMapNodeData>[]; edges: Edge[] };
export type MindMapTree = import("@/lib/mindmaps/schemas").MindMapTree;

/**
 * Constrói um layout em três colunas e mantém cada grupo de folhas junto ao ramo.
 */
export function treeToGraph(tree: MindMapTree, existingId?: string): MindMapGraph {
  const rootId = existingId ?? "concept-center";
  const nodes: Node<MindMapNodeData>[] = [];
  const edges: Edge[] = [];
  const leafGap = 150;
  const branchGap = 110;
  const groupHeights = tree.branches.map((branch) =>
    Math.max(leafGap, branch.children.length * leafGap),
  );
  const totalHeight =
    groupHeights.reduce((sum, height) => sum + height, 0) +
    Math.max(0, tree.branches.length - 1) * branchGap;
  let groupTop = -totalHeight / 2;

  nodes.push({
    id: rootId,
    type: "concept",
    position: { x: 0, y: -45 },
    data: {
      label: tree.title,
      description: tree.summary,
      color: "blue",
      kind: "root",
    },
  });

  tree.branches.forEach((branch, index) => {
    const groupHeight = groupHeights[index] ?? leafGap;
    const branchY = groupTop + groupHeight / 2 - 45;
    const branchId = `${rootId}-branch-${sanitizeId(branch.label)}-${index}`;

    nodes.push({
      id: branchId,
      type: "concept",
      position: { x: 360, y: branchY },
      data: {
        label: branch.label,
        description: branch.description,
        color: mindMapColors[index % mindMapColors.length],
        kind: "branch",
      },
    });
    edges.push({
      id: `edge-${rootId}-${branchId}`,
      source: rootId,
      target: branchId,
      style: { strokeWidth: 2 },
    });

    branch.children.forEach((child, cIndex) => {
      const cx = 720;
      const cy = groupTop + cIndex * leafGap;
      const childId = `${branchId}-leaf-${sanitizeId(child.label)}-${cIndex}`;

      nodes.push({
        id: childId,
        type: "concept",
        position: { x: cx, y: cy },
        data: {
          label: child.label,
          description: child.description,
          color: mindMapColors[index % mindMapColors.length],
          kind: "leaf",
        },
      });
      edges.push({
        id: `edge-${branchId}-${childId}`,
        source: branchId,
        target: childId,
        style: { strokeWidth: 1.4 },
      });
    });

    groupTop += groupHeight + branchGap;
  });

  return { nodes, edges };
}

function sanitizeId(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)
    .toLowerCase() || "n";
}