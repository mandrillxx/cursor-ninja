import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { RuleNode } from '@/lib/types';

interface SemanticRuleFormData {
  name: string;
  description: string;
}

interface SemanticRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<RuleNode, 'id' | 'position'>) => void;
  initialData?: {
    label: string;
    description?: string;
    ruleData: Record<string, unknown>;
  } | null;
  isEditing?: boolean;
}

export default function SemanticRuleDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isEditing
}: SemanticRuleDialogProps) {
  const form = useForm<SemanticRuleFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Set form values if editing an existing rule
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.label,
        description: initialData.description || initialData.ruleData.description as string || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      type: 'semantic',
      data: {
        label: data.name,
        description: data.description,
        ruleData: {
          description: data.description,
        },
      },
    });
    form.reset();
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Semantic Description Rule' : 'Add Semantic Description Rule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="My Semantic Rule"
              {...form.register('name', { required: true })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Semantic Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., Code that handles API requests to the backend"
              className="min-h-[100px] max-h-[200px]"
              {...form.register('description', { required: true })}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">Description is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              Describe in natural language what kind of code this rule should apply to
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 