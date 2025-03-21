import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { RuleNode } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface FrameworkRuleFormData {
  name: string;
  framework: string;
  description: string;
}

interface FrameworkRuleDialogProps {
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

export default function FrameworkRuleDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  isEditing 
}: FrameworkRuleDialogProps) {
  const form = useForm<FrameworkRuleFormData>({
    defaultValues: {
      name: '',
      framework: '',
      description: '',
    },
  });

  // Set form values if editing an existing rule
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.label,
        description: initialData.description || '',
        framework: initialData.ruleData.framework as string || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      type: 'framework',
      data: {
        label: data.name,
        description: data.description,
        ruleData: {
          framework: data.framework,
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
            {isEditing ? 'Edit Framework Rule' : 'Add Framework Rule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="My Framework Rule"
              {...form.register('name', { required: true })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Input
              id="framework"
              placeholder="e.g., react, next.js, vue"
              {...form.register('framework', { required: true })}
            />
            {form.formState.errors.framework && (
              <p className="text-sm text-red-500">Framework is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the name of the framework this rule applies to
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe how this framework should be handled"
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