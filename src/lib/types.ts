import type { Edge, Node } from "reactflow";

export type NodeType =
  | "hub"
  | "framework"
  | "file-pattern"
  | "semantic"
  | "reference"
  | "custom";

export type NodeData = {
  label: string;
  description: string;
  ruleData: Record<string, unknown>;
};

export type RuleNode = {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
};

export interface CursorRule {
  type: NodeType;
  description: string;
  [key: string]: unknown;
}

export interface RuleProject {
  id: string;
  name: string;
  description: string;
  lastModified: number;
  nodes: Node[];
  edges: Edge[];
}

export interface RuleEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: Record<string, string | number>;
}

export type MDCFormat = {
  rules: CursorRule[];
};
