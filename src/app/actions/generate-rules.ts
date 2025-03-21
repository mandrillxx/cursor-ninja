"use server";

import { generateText, generateObject } from "ai";
import { CursorRule } from "@/lib/types";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const openai = createOpenAI({
  // custom settings, e.g.
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

/**
 * Converts rule nodes data to markdown format using AI
 */
export async function generateRuleMarkdown(ruleData: { rules: CursorRule[] }) {
  try {
    // Convert rules to a string representation for the AI prompt
    const rulesString = JSON.stringify(ruleData, null, 2);

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are documenting Cursor IDE rules. Your task is to convert JSON rule format into clean, structured Markdown documentation. " +
        "Do not include any introductory headers about Cursor IDE Rules Documentation.",
      prompt: `Document each rule with:

- A heading using the rule name (## level)
- Clear explanation of what the rule aims to achieve 
- Where and when it applies
- Any relevant configuration details
- Use proper markdown formatting (lists, code blocks where needed)

Rules to document:

${rulesString}`,
    });

    console.log(result.text);

    return {
      success: true,
      markdown: String(result.text),
    };
  } catch (error) {
    console.error("Error generating markdown:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Define schemas for node and edge structures
const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const nodeDataSchema = z.object({
  label: z.string(),
  description: z.string(),
  ruleData: z.record(z.string(), z.unknown()).optional().default({}),
});

const nodeSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "hub",
    "framework",
    "file-pattern",
    "semantic",
    "reference",
    "custom",
  ]),
  position: positionSchema,
  data: nodeDataSchema,
});

const edgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
});

const ruleResultSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

/**
 * Parses natural language text into cursor rule nodes and edges
 */
export async function parseRuleText(
  textContent: string,
  projectName: string,
  projectDescription: string
) {
  try {
    const systemPrompt = `
You are an expert assistant for the Cursor IDE rule system. Your task is to parse natural language descriptions into structured Cursor rule nodes and connections.

The rule system consists of these node types:
- "hub": The central node that all other nodes connect to (always present)
- "framework": Main technology frameworks or libraries used in the project
- "file-pattern": Rules about file organization or naming patterns
- "semantic": Rules about code semantics, style, or patterns
- "reference": References to documentation or external resources
- "custom": Any custom rules that don't fit the above categories

Each node should have:
- A descriptive label
- A detailed description
- Appropriate ruleData properties (framework name for framework nodes, behavior descriptions for custom nodes, etc.)

Connections between nodes should represent logical relationships:
- Framework nodes connect to the central hub
- Semantic, file-pattern, reference nodes connect to relevant framework nodes
- Custom nodes can connect to the hub or to framework nodes

Node positioning guidelines:
- Hub node at center {x: 0, y: 0}
- Framework nodes in a circle around hub at radius 200
- Semantic nodes connect to relevant frameworks, positioned at radius 400
- File pattern nodes at radius 300, grouped by related framework
- Reference nodes at radius 350, near related framework nodes
- Custom nodes positioned flexibly based on their connections

Example layout:
- Hub at (0,0)
- React framework at (200,0)
- TypeScript framework at (0,200) 
- Next.js framework at (-200,0)
- File organization patterns at (-300,100)
- Coding standards at (400,100)
- Component rules at (300,-100)
`;

    const prompt = `
Parse the following text description into Cursor IDE rule nodes and edges. Create appropriate framework nodes for any technologies mentioned, and create semantic/custom/reference nodes for any specific rules, guidelines, or practices mentioned.

Position nodes according to these rules:
1. Place hub at (0,0)
2. Framework nodes evenly spaced in a circle at radius 200
3. Related semantic/pattern nodes near their framework nodes
4. Maintain 100-150px minimum spacing between nodes
5. Group related nodes together
6. Avoid node overlap by adjusting positions

Here's the text to parse:

${textContent}

Project Name: ${projectName}
Project Description: ${projectDescription}
`;

    // Generate structured output using the Zod schema
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
      schema: ruleResultSchema,
      temperature: 0.1,
    });

    // Process the generated object
    if (result) {
      const { nodes, edges } = result.object;

      // Ensure the hub node exists
      if (!nodes.some((node) => node.id === "hub")) {
        nodes.unshift({
          id: "hub",
          type: "hub" as const,
          position: { x: 0, y: 0 },
          data: {
            label: "Hub",
            description: "Central hub for all rules",
            ruleData: {},
          },
        });
      }

      // Add IDs and defaults for any missing properties
      const processedNodes = nodes.map((node) => ({
        ...node,
        id: node.id || `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        position: node.position || { x: 0, y: 0 },
      }));

      // Process edges to ensure they have IDs
      const processedEdges = edges.map((edge) => ({
        ...edge,
        id: edge.id || `edge-${edge.source}-${edge.target}-${Date.now()}`,
        type: edge.type || "smoothstep",
      }));

      return {
        success: true,
        projectName,
        projectDescription,
        nodes: processedNodes,
        edges: processedEdges,
      };
    } else {
      throw new Error("Failed to generate rule structure");
    }
  } catch (error) {
    console.error("Error generating rule structure:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
