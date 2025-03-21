import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { RuleNode } from '@/lib/types';

interface CustomRuleFormData {
  name: string;
  behavior: string;
  description: string;
}

interface CustomRuleDialogProps {
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

export default function CustomRuleDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isEditing
}: CustomRuleDialogProps) {
  const form = useForm<CustomRuleFormData>({
    defaultValues: {
      name: '',
      behavior: '',
      description: '',
    },
  });

  // Set form values if editing an existing rule
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.label,
        description: initialData.description || '',
        behavior: initialData.ruleData.behavior as string || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      type: 'custom',
      data: {
        label: data.name,
        description: data.description,
        ruleData: {
          behavior: data.behavior,
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
            {isEditing ? 'Edit Custom Behavior Rule' : 'Add Custom Behavior Rule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="My Custom Rule"
              {...form.register('name', { required: true })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="behavior">Custom Behavior</Label>
            <Textarea
              id="behavior"
              placeholder="Describe the custom behavior for this rule..."
              className="min-h-[100px]"
              {...form.register('behavior', { required: true })}
            />
            {form.formState.errors.behavior && (
              <p className="text-sm text-red-500">Behavior is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              Specify any custom behavior or instructions that should be applied
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of this rule"
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