import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { RuleNode } from '@/lib/types';

interface FilePatternRuleFormData {
  name: string;
  pattern: string;
  description: string;
}

interface FilePatternRuleDialogProps {
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

export default function FilePatternRuleDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isEditing
}: FilePatternRuleDialogProps) {
  const form = useForm<FilePatternRuleFormData>({
    defaultValues: {
      name: '',
      pattern: '',
      description: '',
    },
  });

  // Set form values if editing an existing rule
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.label,
        description: initialData.description || '',
        pattern: initialData.ruleData.pattern as string || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      type: 'file-pattern',
      data: {
        label: data.name,
        description: data.description,
        ruleData: {
          pattern: data.pattern,
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
            {isEditing ? 'Edit File Pattern Rule' : 'Add File Pattern Rule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="My File Pattern Rule"
              {...form.register('name', { required: true })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern">File Pattern</Label>
            <Textarea
              id="pattern"
              placeholder="e.g., *.js, src/**/*.tsx"
              {...form.register('pattern', { required: true })}
            />
            {form.formState.errors.pattern && (
              <p className="text-sm text-red-500">Pattern is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supports glob patterns like *.js, **/*.tsx, src/components/*.jsx
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe how files matching this pattern should be handled"
              className="min-h-[100px]"
              {...form.register('description', { required: true })}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">Description is required</p>
            )}
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