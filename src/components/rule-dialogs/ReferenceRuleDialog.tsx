import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { RuleNode } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface ReferenceRuleFormData {
  name: string;
  file: string;
  description: string;
}

interface ReferenceRuleDialogProps {
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

export default function ReferenceRuleDialog({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isEditing
}: ReferenceRuleDialogProps) {
  const form = useForm<ReferenceRuleFormData>({
    defaultValues: {
      name: '',
      file: '',
      description: '',
    },
  });

  // Set form values if editing an existing rule
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.label,
        description: initialData.description || '',
        file: initialData.ruleData.file as string || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSave({
      type: 'reference',
      data: {
        label: data.name,
        description: data.description,
        ruleData: {
          file: data.file,
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
            {isEditing ? 'Edit Reference File Rule' : 'Add Reference File Rule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="My Reference Rule"
              {...form.register('name', { required: true })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Reference File Path</Label>
            <Input
              id="file"
              placeholder="e.g., src/components/Button.tsx"
              {...form.register('file', { required: true })}
            />
            {form.formState.errors.file && (
              <p className="text-sm text-red-500">File path is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              Path to an example file that should be referenced
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe how this reference file should be used"
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