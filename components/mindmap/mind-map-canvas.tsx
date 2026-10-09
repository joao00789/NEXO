"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Check, Plus, Save, Trash2, ZoomIn, ZoomOut, Maximize2, ArrowLeftRight } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveMindMapAction } from "@/lib/mindmaps/actions";
import { mindMapColors } from "@/lib/mindmaps/schemas";
import type { MindMapGraph, MindMapNodeData } from "@/lib/mindmaps/templates";
import { useReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const colorPalette = {
  blue: { label: "Azul", value: "#2E6BFF" },
  cyan: { label: "Ciano", value: "#22D3EE" },
  violet: { label: "Violeta", value: "#A78BFA" },
  teal: { label: "Turquesa", value: "#2DD4BF" },
  amber: { label: "Âmbar", value: "#FBBF24" },
  rose: { label: "Rosa", value: "#FB7185" },
} as const;

const kindLabels = {
  root: "Raiz",
  branch: "Ramo",
  leaf: "Folha",
} as const;

function ConceptNode({ data, selected }: NodeProps<Node<MindMapNodeData>>) {
  const color = colorPalette[data.color ?? "blue"].value;

  return (
    <div
      className="min-w-40 max-w-60 rounded-xl border border-l-4 bg-[#17181B] px-3 py-2 text-[#F5F5F5] shadow-lg transition-shadow"
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}55, 0 8px 24px #0008` : "0 8px 24px #0007" }}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-2 !border-[#17181B]" style={{ background: color }} />
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-xs leading-snug font-semibold">{data.label}</p>
        {data.kind && kindLabels[data.kind] ? (
          <span className="rounded-full bg-[#0A0A0B]/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#F5F5F5]/80">
            {kindLabels[data.kind]}
          </span>
        ) : null}
      </div>
      {data.description ? <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-[#9A9CA3]">{data.description}</p> : null}
      <Handle type="source" position={Position.Right} className="!size-2 !border-2 !border-[#17181B]" style={{ background: color }} />
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

export default function MindMapCanvas({
  id,
  title,
  initialGraph,
}: {
  id: string;
  title: string;
  initialGraph: MindMapGraph;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<MindMapNodeData>>(
    initialGraph.nodes.map((node, index) => ({
      ...node,
      type: "concept",
      data: { ...node.data, color: node.data.color ?? mindMapColors[index % mindMapColors.length] },
    })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialGraph.edges);
  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedNode = nodes.find((node) => node.selected);
  const colorsByNodeId = useMemo(
    () => new Map(nodes.map((node) => [node.id, colorPalette[node.data.color ?? "blue"].value])),
    [nodes],
  );
  const displayedEdges = useMemo(() => edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      stroke: colorsByNodeId.get(edge.target) ?? colorsByNodeId.get(edge.source) ?? "#62666F",
      strokeWidth: 2,
    },
  })), [colorsByNodeId, edges]);
  const colorNames = Object.entries(colorPalette) as [keyof typeof colorPalette, (typeof colorPalette)[keyof typeof colorPalette]][];

  const onConnect = useCallback((connection: Connection) => {
    setEdges((current) => addEdge(connection, current));
    setSaved(false);
  }, [setEdges]);

  const onLabelChange = useCallback((label: string) => {
    if (!selectedNode) return;
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label: label.slice(0, 180) } }
          : node,
      ),
    );
    setSaved(false);
  }, [selectedNode, setNodes]);

  const onDescriptionChange = useCallback((description: string) => {
    if (!selectedNode) return;
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, description: description.slice(0, 500) } }
          : node,
      ),
    );
    setSaved(false);
  }, [selectedNode, setNodes]);

  const onColorChange = useCallback((color: typeof mindMapColors[number]) => {
    if (!selectedNode) return;
    setNodes((current) => current.map((node) => node.id === selectedNode.id
      ? { ...node, data: { ...node.data, color } }
      : node));
    setSaved(false);
  }, [selectedNode, setNodes]);

  const addConcept = useCallback(() => {
    if (nodes.length >= 40) return;
    const nextIndex = nodes.length + 1;
    const node: Node<MindMapNodeData> = {
      id: crypto.randomUUID(),
      type: "concept",
      position: { x: 180 + (nextIndex % 3) * 80, y: nextIndex * 80 },
      data: { label: "Novo conceito", color: mindMapColors[nextIndex % mindMapColors.length] },
      selected: true,
    };
    setNodes((current) => {
      const next: Node<MindMapNodeData>[] = current.map((item) => ({ ...item, selected: false }));
      next.push(node);
      return next;
    });
    setSaved(false);
  }, [nodes.length, setNodes]);

  const removeSelected = useCallback(() => {
    if (!selectedNode || nodes.length <= 1) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSaved(false);
  }, [nodes.length, selectedNode, setEdges, setNodes]);

  const graph = useMemo(
    () => ({
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: String(node.data.label ?? "Conceito"),
          ...(typeof node.data.description === "string" && node.data.description.length > 0
            ? { description: node.data.description }
            : {}),
          color: node.data.color ?? "blue",
          ...(node.data.kind ? { kind: node.data.kind } : {}),
        },
      })),
      edges: edges.map(({ id: edgeId, source, target }) => ({ id: edgeId, source, target })),
    }),
    [edges, nodes],
  );

  const handleSave = () => {
    setSaveError("");
    setSaved(false);
    startSaving(async () => {
      const result = await saveMindMapAction(id, graph);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaved(true);
      }
    });
  };

  return (
    <section className="flex flex-col gap-4" aria-label={`Editor do mapa ${title}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">Arraste os conceitos e conecte as ideias.</p>
            <p className="text-muted-foreground mt-1 text-xs">Até 40 conceitos e 80 conexões. Layout radial e melhor visualização por ramos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={addConcept} disabled={nodes.length >= 40}>
              <Plus aria-hidden="true" /> Adicionar conceito
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const filename = `${title
                  .toLocaleLowerCase("pt-BR")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "") || "mapa-mental"}.json`;
                const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar .json
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {saved ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
              {isSaving ? "Salvando..." : saved ? "Salvo" : "Salvar mapa"}
            </Button>
          </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-surface border-border h-[64vh] min-h-130 overflow-hidden rounded-xl border">
          <ReactFlow
            nodes={nodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodesConnectable={edges.length < 80}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.25}
            maxZoom={1.8}
            deleteKeyCode={null}
            aria-label="Mapa mental interativo"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="!overflow-hidden !rounded-lg !border !border-[#282A2E] !bg-[#17181B] [&_button]:!border-[#282A2E] [&_button]:!bg-[#17181B] [&_button]:!fill-[#F5F5F5] [&_button]:!text-[#F5F5F5] [&_button:hover]:!bg-[#282A2E]" />
            <ControlsExtra />
            <MiniMap
              pannable
              zoomable
              style={{ backgroundColor: "#17181B", border: "1px solid #282A2E" }}
              maskColor="rgb(10 10 11 / 55%)"
              nodeColor={(node) => {
                const nodeData = node.data as MindMapNodeData;
                return colorPalette[nodeData.color ?? "blue"].value;
              }}
            />
          </ReactFlow>
        </div>

        <aside className="bg-surface border-border flex flex-col gap-4 rounded-xl border p-4" aria-label="Editar conceito selecionado">
          <div>
            <h2 className="text-sm font-semibold">Conceito selecionado</h2>
            <p className="text-muted-foreground mt-1 text-xs">Selecione um nó no mapa para editar o texto.</p>
          </div>
          {selectedNode ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="node-label">Título</Label>
                <Input
                  id="node-label"
                  value={String(selectedNode.data.label ?? "")}
                  maxLength={180}
                  onChange={(event) => onLabelChange(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="node-description">Explicação curta</Label>
                <Textarea
                  id="node-description"
                  value={String(selectedNode.data.description ?? "")}
                  maxLength={500}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder="Adicione uma definição ou exemplo"
                />
              </div>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Cor do ramo</legend>
                <div className="flex flex-wrap gap-2">
                  {colorNames.map(([key, color]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Cor ${color.label}`}
                      aria-pressed={(selectedNode.data.color ?? "blue") === key}
                      onClick={() => onColorChange(key)}
                      className="size-7 rounded-full border-2 border-[#F5F5F5]/50 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#F5F5F5] aria-pressed:ring-2 aria-pressed:ring-[#F5F5F5] aria-pressed:ring-offset-2 aria-pressed:ring-offset-[#111214]"
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </fieldset>
              <Button type="button" variant="outline" onClick={removeSelected} disabled={nodes.length <= 1}>
                <Trash2 aria-hidden="true" /> Remover conceito
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              Clique em um conceito para ajustar título e explicação.
            </p>
          )}
          {saveError ? <p role="alert" className="text-destructive text-sm">{saveError}</p> : null}
          {saved ? <p role="status" className="text-sm text-emerald-400">Alterações salvas.</p> : null}
        </aside>
      </div>
    </section>
  );
}

function ControlsExtra() {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-[#282A2E] bg-[#17181B] p-1 shadow-lg">
      <button
        type="button"
        onClick={() => zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#F5F5F5] transition-colors hover:bg-[#282A2E]"
        aria-label="Aumentar zoom"
      >
        <ZoomIn aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#F5F5F5] transition-colors hover:bg-[#282A2E]"
        aria-label="Diminuir zoom"
      >
        <ZoomOut aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => fitView({ padding: 0.25 })}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#F5F5F5] transition-colors hover:bg-[#282A2E]"
        aria-label="Ajustar à tela"
      >
        <Maximize2 aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#F5F5F5] transition-colors hover:bg-[#282A2E]"
        aria-label="Centralizar na raiz"
      >
        <ArrowLeftRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}
