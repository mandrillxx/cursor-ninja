import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { produce } from "immer";

import { RuleNode, CursorRule, NodeType } from "./types";

// Helper function to deep clone objects to avoid proxy issues
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Define local storage key for autosave
const AUTOSAVE_KEY = "cursor-rules-autosave";

// Autosave helper functions
const saveToLocalStorage = (data: { nodes: Node[]; edges: Edge[] }) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Failed to autosave to localStorage:", error);
  }
};

const loadFromLocalStorage = (): { nodes: Node[]; edges: Edge[] } | null => {
  try {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(AUTOSAVE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
  } catch (error) {
    console.error("Failed to load autosaved data:", error);
  }
  return null;
};

interface RuleStoreState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: RuleNode, connectToHub?: boolean) => void;
  updateNodeData: (nodeId: string, data: Partial<RuleNode["data"]>) => void;
  setStoreData: (nodes: Node[], edges: Edge[]) => void;
  undo: () => void;
  redo: () => void;
  generateRuleFile: () => { rules: CursorRule[] };
  saveCurrentState: () => { nodes: Node[]; edges: Edge[] };
  removeNode: (nodeId: string) => void;
}

// Function to generate rules from nodes and edges
function generateRulesFromGraph(nodes: Node[], edges: Edge[]): CursorRule[] {
  // Find the framework nodes which are directly connected to the hub
  const frameworkNodes = nodes.filter((node) => node.type === "framework");

  // Create a mapping of node IDs to their connected nodes
  const nodeConnections: Record<string, string[]> = {};

  edges.forEach((edge) => {
    if (!nodeConnections[edge.source]) {
      nodeConnections[edge.source] = [];
    }
    nodeConnections[edge.source].push(edge.target);
  });

  // Helper function to build the rule tree recursively
  const buildRuleTree = (
    nodeId: string,
    visited = new Set<string>()
  ): CursorRule | null => {
    // Prevent infinite recursion
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    // Skip the hub node
    if (node.type === "hub") return null;

    // Create the base rule with the common properties
    const rule: CursorRule = {
      type: node.type as NodeType,
      description: node.data.description || "",
      ...node.data.ruleData,
    };

    // Find any connected child nodes and add them as children
    const children = nodeConnections[nodeId] || [];
    if (children.length > 0) {
      const childRules = children
        .map((childId) => buildRuleTree(childId, new Set(visited)))
        .filter(Boolean) as CursorRule[];

      if (childRules.length > 0) {
        rule.children = childRules;
      }
    }

    return rule;
  };

  // Generate rules starting from each framework node
  const rules = frameworkNodes
    .map((node) => buildRuleTree(node.id))
    .filter(Boolean) as CursorRule[];

  return rules;
}

// Create a history system to support undo/redo
interface HistoryState {
  past: { nodes: Node[]; edges: Edge[] }[];
  present: { nodes: Node[]; edges: Edge[] };
  future: { nodes: Node[]; edges: Edge[] }[];
}

// Create a separate history state outside the store
const historyState: HistoryState = {
  past: [],
  present: {
    nodes: [
      {
        id: "hub",
        type: "hub",
        position: { x: 0, y: 0 },
        data: {
          label: "Hub",
          description: "Central hub for all rules",
          ruleData: {},
        },
      },
    ],
    edges: [],
  },
  future: [],
};

// Helper to save state to history without triggering other store updates
const saveToHistory = (newPresent: { nodes: Node[]; edges: Edge[] }) => {
  historyState.past.push(deepClone(historyState.present));
  historyState.present = deepClone(newPresent);
  historyState.future = [];

  // Autosave whenever history is updated
  saveToLocalStorage(newPresent);
};

// Central store with history tracking
export const useRuleStore = create<RuleStoreState>()((set, get) => {
  // Initial state with a hub node
  const initialState = {
    nodes: [
      {
        id: "hub",
        type: "hub",
        position: { x: 0, y: 0 },
        data: {
          label: "Hub",
          description: "Central hub for all rules",
          ruleData: {},
        },
      },
    ],
    edges: [],
  };

  // Try to load autosaved data
  const savedData = loadFromLocalStorage();
  if (savedData && savedData.nodes.length > 0) {
    historyState.present = deepClone(savedData);
    // Use casting to satisfy TypeScript for the initial state
    initialState.nodes = savedData.nodes as typeof initialState.nodes;
    initialState.edges = savedData.edges as typeof initialState.edges;
  }

  return {
    // Initial state
    ...initialState,

    // State change handlers
    onNodesChange: (changes: NodeChange[]) => {
      set(
        produce((draft: RuleStoreState) => {
          const newNodes = applyNodeChanges(changes, draft.nodes);
          draft.nodes = newNodes;
          saveToHistory({ nodes: newNodes, edges: draft.edges });
        })
      );
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      set(
        produce((draft: RuleStoreState) => {
          const newEdges = applyEdgeChanges(changes, draft.edges);
          draft.edges = newEdges;
          saveToHistory({ nodes: draft.nodes, edges: newEdges });
        })
      );
    },

    onConnect: (connection: Connection) => {
      set(
        produce((draft: RuleStoreState) => {
          const id = `edge-${connection.source}-${
            connection.target
          }-${Date.now()}`;
          const newEdges = addEdge({ ...connection, id }, draft.edges);
          draft.edges = newEdges;
          saveToHistory({ nodes: draft.nodes, edges: newEdges });
        })
      );
    },

    addNode: (node: RuleNode, connectToHub = false) => {
      set(
        produce((draft: RuleStoreState) => {
          draft.nodes.push(node as Node);

          // If connectToHub is true, connect this node to the hub
          if (connectToHub) {
            const id = `edge-hub-${node.id}-${Date.now()}`;
            draft.edges.push({
              id,
              source: "hub",
              target: node.id,
              type: "smoothstep",
            });
          }

          saveToHistory({ nodes: draft.nodes, edges: draft.edges });
        })
      );
    },

    updateNodeData: (nodeId: string, data: Partial<RuleNode["data"]>) => {
      set(
        produce((draft: RuleStoreState) => {
          const nodeIndex = draft.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex !== -1) {
            draft.nodes[nodeIndex].data = {
              ...draft.nodes[nodeIndex].data,
              ...data,
            };
            saveToHistory({ nodes: draft.nodes, edges: draft.edges });
          }
        })
      );
    },

    setStoreData: (nodes: Node[], edges: Edge[]) => {
      set({
        nodes: deepClone(nodes),
        edges: deepClone(edges),
      });
      saveToHistory({
        nodes: deepClone(nodes),
        edges: deepClone(edges),
      });
    },

    undo: () => {
      if (historyState.past.length > 0) {
        const previous = deepClone(historyState.past.pop()!);
        historyState.future.unshift(deepClone(historyState.present));
        historyState.present = previous;

        set({ ...previous });
      }
    },

    redo: () => {
      if (historyState.future.length > 0) {
        const next = deepClone(historyState.future.shift()!);
        historyState.past.push(deepClone(historyState.present));
        historyState.present = next;

        set({ ...next });
      }
    },

    generateRuleFile: () => {
      const { nodes, edges } = get();
      const rules = generateRulesFromGraph(deepClone(nodes), deepClone(edges));
      return { rules };
    },

    saveCurrentState: () => {
      const { nodes, edges } = get();
      const state = {
        nodes: deepClone(nodes),
        edges: deepClone(edges),
      };
      saveToLocalStorage(state);
      return state;
    },

    removeNode: (nodeId: string) => {
      set(
        produce((draft: RuleStoreState) => {
          // Remove the node
          const nodeIndex = draft.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex !== -1) {
            draft.nodes.splice(nodeIndex, 1);

            // Also remove any edges connected to this node
            draft.edges = draft.edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId
            );

            saveToHistory({ nodes: draft.nodes, edges: draft.edges });
          }
        })
      );
    },
  };
});
