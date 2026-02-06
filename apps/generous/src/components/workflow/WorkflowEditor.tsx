"use client";

import { Button } from "@generous/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ToolNode, WorkflowDefinition, WorkflowEdge } from "@/lib/workflow/types";
import { ConditionNodeComponent } from "./nodes/ConditionNode";
import { OutputNodeComponent } from "./nodes/OutputNode";
import { ToolNodeComponent } from "./nodes/ToolNode";
import styles from "./WorkflowEditor.module.css";
import { WorkflowSidebar } from "./WorkflowSidebar";
import { WorkflowToolbar } from "./WorkflowToolbar";

interface WorkflowEditorProps {
  workflow: WorkflowDefinition;
  onChange: (workflow: WorkflowDefinition) => void;
  onSave: () => Promise<void>;
  onRun: () => Promise<void>;
  isSaving?: boolean;
  isRunning?: boolean;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
}

interface ConnectionState {
  sourceId: string;
  sourceHandle?: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function WorkflowEditor({
  workflow,
  onChange,
  onSave,
  onRun,
  isSaving,
  isRunning,
}: WorkflowEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [canvasOffset, _setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, _setZoom] = useState(1);

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId);

  // Handle node position update
  const updateNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      onChange({
        ...workflow,
        nodes: workflow.nodes.map((n) => (n.id === nodeId ? { ...n, position: { x, y } } : n)),
      });
    },
    [workflow, onChange],
  );

  // Handle node update
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<ToolNode>) => {
      onChange({
        ...workflow,
        nodes: workflow.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
      });
    },
    [workflow, onChange],
  );

  // Handle node deletion
  const deleteNode = useCallback(
    (nodeId: string) => {
      onChange({
        ...workflow,
        nodes: workflow.nodes.filter((n) => n.id !== nodeId),
        edges: workflow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [workflow, onChange, selectedNodeId],
  );

  // Handle adding a new node
  const addNode = useCallback(
    (type: ToolNode["data"]["type"], toolId?: string) => {
      const id = `node-${Date.now()}`;
      const newNode: ToolNode = {
        id,
        position: { x: 200 + Math.random() * 100, y: 100 + Math.random() * 100 },
        data:
          type === "tool"
            ? { type: "tool", toolId: toolId || "", params: {} }
            : type === "condition"
              ? {
                  type: "condition",
                  condition: { leftOperand: "", operator: "eq", rightOperand: "" },
                }
              : type === "output"
                ? { type: "output", output: { type: "data" } }
                : type === "trigger"
                  ? { type: "trigger", trigger: { type: "manual" } }
                  : type === "transform"
                    ? { type: "transform", transform: { expression: "", inputMapping: {} } }
                    : type === "loop"
                      ? { type: "loop", loop: { items: "", itemVar: "item" } }
                      : type === "delay"
                        ? { type: "delay", delayMs: 1000 }
                        : { type: "parallel", branches: [], waitForAll: true },
        label: type.charAt(0).toUpperCase() + type.slice(1),
      };

      onChange({
        ...workflow,
        nodes: [...workflow.nodes, newNode],
      });
      setSelectedNodeId(id);
    },
    [workflow, onChange],
  );

  // Handle adding an edge
  const addEdge = useCallback(
    (source: string, target: string, sourceHandle?: string) => {
      // Prevent self-loops and duplicate edges
      if (source === target) return;
      const exists = workflow.edges.some((e) => e.source === source && e.target === target);
      if (exists) return;

      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        source,
        target,
        sourceHandle,
      };

      onChange({
        ...workflow,
        edges: [...workflow.edges, newEdge],
      });
    },
    [workflow, onChange],
  );

  // Handle edge deletion
  const deleteEdge = useCallback(
    (edgeId: string) => {
      onChange({
        ...workflow,
        edges: workflow.edges.filter((e) => e.id !== edgeId),
      });
    },
    [workflow, onChange],
  );

  // Mouse handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return;
      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setDragState({
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.position.x,
        nodeStartY: node.position.y,
      });
      setSelectedNodeId(nodeId);
    },
    [workflow.nodes],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragState) {
        const dx = (e.clientX - dragState.startX) / zoom;
        const dy = (e.clientY - dragState.startY) / zoom;
        updateNodePosition(dragState.nodeId, dragState.nodeStartX + dx, dragState.nodeStartY + dy);
      }
      if (connectionState) {
        setConnectionState({
          ...connectionState,
          currentX: e.clientX,
          currentY: e.clientY,
        });
      }
    },
    [dragState, connectionState, updateNodePosition, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setConnectionState(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Start connection from a node
  const startConnection = useCallback((nodeId: string, x: number, y: number, handle?: string) => {
    setConnectionState({
      sourceId: nodeId,
      sourceHandle: handle,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  }, []);

  // Complete connection to a node
  const completeConnection = useCallback(
    (targetId: string) => {
      if (connectionState) {
        addEdge(connectionState.sourceId, targetId, connectionState.sourceHandle);
        setConnectionState(null);
      }
    },
    [connectionState, addEdge],
  );

  // Render edge path
  const renderEdge = (edge: WorkflowEdge) => {
    const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
    const targetNode = workflow.nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    const sx = sourceNode.position.x + 120; // Right side of node
    const sy = sourceNode.position.y + 40; // Middle of node
    const tx = targetNode.position.x; // Left side of target
    const ty = targetNode.position.y + 40;

    const midX = (sx + tx) / 2;
    const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;

    return (
      <g key={edge.id} className={styles.edge}>
        <path d={path} className={styles.edgePath} />
        <path d={path} className={styles.edgeHitArea} onClick={() => deleteEdge(edge.id)} />
      </g>
    );
  };

  // Render node component based on type
  const renderNode = (node: ToolNode) => {
    const isSelected = selectedNodeId === node.id;
    const commonProps = {
      node,
      isSelected,
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, node.id),
      onDelete: () => deleteNode(node.id),
      onStartConnection: (x: number, y: number, handle?: string) =>
        startConnection(node.id, x, y, handle),
      onCompleteConnection: () => completeConnection(node.id),
    };

    switch (node.data.type) {
      case "tool":
        return <ToolNodeComponent key={node.id} {...commonProps} />;
      case "condition":
        return <ConditionNodeComponent key={node.id} {...commonProps} />;
      case "output":
        return <OutputNodeComponent key={node.id} {...commonProps} />;
      default:
        return (
          <div
            key={node.id}
            className={`${styles.node} ${isSelected ? styles.nodeSelected : ""}`}
            style={{
              left: node.position.x,
              top: node.position.y,
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <div className={styles.nodeHeader}>
              <span className={styles.nodeType}>{node.data.type}</span>
              <button
                type="button"
                className={styles.nodeDelete}
                onClick={() => deleteNode(node.id)}
              >
                ×
              </button>
            </div>
            <div className={styles.nodeLabel}>{node.label}</div>
            {/* Connection handles */}
            <div className={styles.handleInput} onMouseUp={() => completeConnection(node.id)} />
            <div
              className={styles.handleOutput}
              onMouseDown={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                startConnection(node.id, rect.right, rect.top + rect.height / 2);
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <WorkflowToolbar
        workflow={workflow}
        onSave={onSave}
        onRun={onRun}
        isSaving={isSaving}
        isRunning={isRunning}
      />

      <div className={styles.main}>
        <WorkflowSidebar
          onAddNode={addNode}
          selectedNode={selectedNode}
          onUpdateNode={(updates) => selectedNode && updateNode(selectedNode.id, updates)}
        />

        <div className={styles.canvas} ref={canvasRef}>
          <svg aria-hidden="true" className={styles.edgesSvg}>
            {workflow.edges.map(renderEdge)}
            {/* Connection preview */}
            {connectionState && (
              <line
                x1={connectionState.startX}
                y1={connectionState.startY}
                x2={connectionState.currentX}
                y2={connectionState.currentY}
                className={styles.connectionPreview}
              />
            )}
          </svg>

          <div
            className={styles.nodesContainer}
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            }}
          >
            {workflow.nodes.map(renderNode)}
          </div>

          {workflow.nodes.length === 0 && (
            <div className={styles.emptyState}>
              <p>Drag nodes from the sidebar to get started</p>
              <p>or</p>
              <Button onClick={() => addNode("trigger")}>Add Trigger Node</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
