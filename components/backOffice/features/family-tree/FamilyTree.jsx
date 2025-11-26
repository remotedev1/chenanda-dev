"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { Sidebar } from "./Sidebar";
import { CustomNode } from "./CustomNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = { custom: CustomNode };

const initialNodes = [
  {
    id: "1",
    position: { x: 300, y: 50 },
    data: { label: "Root Person", role: "Main person" },
    type: "custom",
  },
];

const initialEdges = [];

let id = initialNodes.length;
const getNextId = () => `person-${++id}`;

export default function FamilyTreePage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleAddPerson = useCallback(() => {
    if (!selectedNodeId) {
      alert("Please select a person to connect the new person to.");
      return;
    }

    const parentNode = nodes.find((node) => node.id === selectedNodeId);
    if (!parentNode) return;

    const existingChildren = nodes.filter((n) =>
      edges.some((e) => e.source === parentNode.id && e.target === n.id)
    );
    const childIndex = existingChildren.length;

    const newNodeId = getNextId();
    const newNode = {
      id: newNodeId,
      position: {
        x:
          parentNode.position.x +
          childIndex * 200 -
          existingChildren.length * 100,
        y: parentNode.position.y + 150,
      },
      data: { label: "New Person", role: "Relative" },
      type: "custom",
    };

    const newEdge = {
      id: `e${selectedNodeId}-${newNodeId}`,
      source: selectedNodeId,
      target: newNodeId,
      type: "smoothstep",
      style: { stroke: "black" },
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
  }, [selectedNodeId, nodes, edges]);

  // 📤 Export tree as JSON file
  const handleExport = useCallback(() => {
    const treeData = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([treeData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // 🔄 Reset tree
  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
  }, []);

  // 🔧 Update node data
  const handleUpdateNode = useCallback((id, newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
  }, []);

  // Handle selection + other changes
  const onNodesChange = useCallback((changes) => {
    const selectionChange = changes.find((c) => c.type === "select");
    if (selectionChange) {
      setSelectedNodeId(selectionChange.selected ? selectionChange.id : null);
    }
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: "smoothstep", style: { stroke: "black" } },
          eds
        )
      ),
    []
  );

  // ⬇️ Load tree from DB on mount
  useEffect(() => {
    fetch("/api/family-tree")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded tree:", data);
        if (data) {
          setNodes(data.treeData.nodes);
          setEdges(data.treeData.edges);
        }
      });
  }, []);

  // 💾 Save tree to DB
  const handleSaveToDb = async () => {
    const res = await fetch("/api/family-tree", {
      method: "POST", // now acts as create-or-update
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "My First Tree",
        treeData: { nodes, edges },
      }),
    });

    if (res.ok) alert("Family tree saved successfully!");
    else alert("Failed to save tree.");
  };

  return (
    <div className="flex w-screen h-screen">
      <Sidebar
        onAddPerson={handleAddPerson}
        onExport={handleExport}
        onReset={handleReset}
        onSave={handleSaveToDb} // 👈 added save button
      />
      <div className="flex-grow">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: { ...node.data, onUpdate: handleUpdateNode },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            onNodeClick={(event, node) => setSelectedNodeId(node.id)}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
