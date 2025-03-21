# Cursor Rules

A tool for creating, managing, and sharing coding standards and best practices for your team through a visual node-based editor.

## Features

- **Visual Rule Editor**: Create and connect rule nodes in an intuitive graph interface
- **Multiple Rule Types**: Support for different types of rules:

  - Hub nodes for organizing rule categories
  - Framework nodes for technology specifications
  - File pattern nodes for enforcing file structure
  - Semantic nodes for code style and patterns
  - Reference nodes for linking to documentation
  - Custom nodes for specialized rules

- **Import/Export**:

  - Import rules from JSON files
  - Import rules from natural language text (.cursorrule)
  - Export rules to JSON for sharing with your team

- **Project Management**: Create, save, and manage multiple rule projects

## Using the Natural Language Import

Cursor Rules lets you define coding standards using natural language that gets automatically converted into structured rule nodes.

To import from natural language:

1. Click "Import" in the Project Selector
2. Choose "Import from .cursorrule"
3. Enter a project name and optional description
4. Paste your rule text or use the example template
5. Click "Import & Convert"

The AI will process your text and generate a complete rule graph with appropriate node types and connections.

### Example .cursorrule format

```
This project follows the React Best Practices for our team.

Technologies:
- React 18+ with TypeScript
- Next.js for server components and routing
- TailwindCSS for styling
- React Query for data fetching

Coding Standards:
1. Use functional components with hooks instead of class components
2. Prefer named exports over default exports
3. Use React.memo for performance optimization when needed
4. Keep component files under 300 lines, extract larger components into smaller ones
5. Use TypeScript interfaces for props and state

File Organization:
- Components should be in the /components directory
- Pages should be in the /app directory following Next.js app router conventions
- Utility functions should be in the /utils directory
- Reusable hooks should be in the /hooks directory

API Patterns:
- Use React Query for API calls with proper caching
- Handle loading and error states consistently across the app
- All API calls should be in separate files in the /api directory
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open http://localhost:3000 in your browser

## License

MIT
