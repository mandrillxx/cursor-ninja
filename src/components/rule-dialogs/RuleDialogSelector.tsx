import React from 'react';
import { NodeType, RuleNode } from '@/lib/types';
import FrameworkRuleDialog from './FrameworkRuleDialog';
import FilePatternRuleDialog from './FilePatternRuleDialog';
import SemanticRuleDialog from './SemanticRuleDialog';
import ReferenceRuleDialog from './ReferenceRuleDialog';
import CustomRuleDialog from './CustomRuleDialog';

interface RuleDialogSelectorProps {
  selectedNodeType: NodeType | null;
  onClose: () => void;
  onSave: (rule: Omit<RuleNode, 'id' | 'position'>) => void;
  nodeData: {
    label: string;
    description?: string;
    ruleData: Record<string, unknown>;
  } | null;
}

export default function RuleDialogSelector({
  selectedNodeType,
  onClose,
  onSave,
  nodeData,
}: RuleDialogSelectorProps) {
  if (!selectedNodeType) return null;

  // Common props for all dialogs
  const dialogProps = {
    isOpen: true,
    onClose,
    onSave,
    initialData: nodeData,
    isEditing: !!nodeData,
  };

  switch (selectedNodeType) {
    case 'framework':
      return <FrameworkRuleDialog {...dialogProps} />;
    case 'file-pattern':
      return <FilePatternRuleDialog {...dialogProps} />;
    case 'semantic':
      return <SemanticRuleDialog {...dialogProps} />;
    case 'reference':
      return <ReferenceRuleDialog {...dialogProps} />;
    case 'custom':
      return <CustomRuleDialog {...dialogProps} />;
    default:
      return null;
  }
} 