import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Eye } from 'lucide-react';
import { JSONSchema, SchemaProperty } from '@/types/schema';
import { useToast } from '@/hooks/use-toast';
import { PropertyBuilder } from './PropertyBuilder';

interface SchemaBuilderProps {
  initialSchema?: {
    category: string;
    eventType: string;
    schema: JSONSchema;
  };
  onSave: (data: { category: string; eventType: string; schema: JSONSchema }) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  initialSchema,
  onSave,
  onCancel,
  isEdit = false,
}) => {
  const { toast } = useToast();
  const [category, setCategory] = useState(initialSchema?.category || '');
  const [eventType, setEventType] = useState(initialSchema?.eventType || '');
  const [title, setTitle] = useState(initialSchema?.schema.title || '');
  const [description, setDescription] = useState(initialSchema?.schema.description || '');
  const [additionalProperties, setAdditionalProperties] = useState(
    initialSchema?.schema.additionalProperties || false
  );
  const [properties, setProperties] = useState<Record<string, SchemaProperty>>(
    initialSchema?.schema.properties || {}
  );
  const [required, setRequired] = useState<string[]>(initialSchema?.schema.required || []);
  const [showPreview, setShowPreview] = useState(false);
  const [isMultiStep, setIsMultiStep] = useState(false);

  const addProperty = () => {
    const propertyName = `property_${Object.keys(properties).length + 1}`;
    setProperties({
      ...properties,
      [propertyName]: {
        type: 'string',
        description: '',
      },
    });
  };

  const updateProperty = (name: string, property: SchemaProperty) => {
    setProperties({
      ...properties,
      [name]: property,
    });
  };

  const removeProperty = (name: string) => {
    const newProperties = { ...properties };
    delete newProperties[name];
    setProperties(newProperties);
    setRequired(required.filter(req => req !== name));
  };

  const toggleRequired = (name: string) => {
    if (required.includes(name)) {
      setRequired(required.filter(req => req !== name));
    } else {
      setRequired([...required, name]);
    }
  };

  const renameProperty = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return;
    
    const newProperties = { ...properties };
    newProperties[newName] = newProperties[oldName];
    delete newProperties[oldName];
    setProperties(newProperties);

    if (required.includes(oldName)) {
      setRequired(required.map(req => req === oldName ? newName : req));
    }
  };

  const handleSave = () => {
    if (!category.trim() || !eventType.trim() || !title.trim()) {
      toast({
        title: "Validation Error",
        description: "Category, Event Type, and Title are required.",
        variant: "destructive",
      });
      return;
    }

    const schema: JSONSchema = {
      title,
      description,
      type: 'object',
      properties,
      required,
      additionalProperties,
    };

    onSave({ category, eventType, schema });
  };

  const generatePreview = () => {
    return {
      category,
      eventType,
      schema: {
        title,
        description,
        type: 'object',
        properties,
        required,
        additionalProperties,
      },
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Schema' : 'Create New Schema'}</CardTitle>
          <CardDescription>
            Define the structure and validation rules for your product schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., electronics, clothing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g., product_created, product_updated"
              />
            </div>
          </div>

          {/* Schema Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Schema Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Electronics Product Schema"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Schema Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this schema represents..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="additionalProperties"
                checked={additionalProperties}
                onCheckedChange={setAdditionalProperties}
              />
              <Label htmlFor="additionalProperties">Allow additional properties</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="multiStep"
                checked={isMultiStep}
                onCheckedChange={setIsMultiStep}
              />
              <Label htmlFor="multiStep">Multi-step form</Label>
              <span className="text-xs text-muted-foreground">
                Break form into multiple steps for better UX
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Define the fields for this schema</CardDescription>
          </div>
          <Button 
            onClick={addProperty} 
            variant="outline" 
            size="sm"
            disabled={!category.trim() || !eventType.trim() || !title.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(properties).map(([name, property]) => (
              <PropertyBuilder
                key={name}
                name={name}
                property={property}
                isRequired={required.includes(name)}
                onUpdate={(updatedProperty) => updateProperty(name, updatedProperty)}
                onRemove={() => removeProperty(name)}
                onToggleRequired={() => toggleRequired(name)}
                onRename={(newName) => renameProperty(name, newName)}
              />
            ))}
            
            {Object.keys(properties).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No properties defined. Click "Add Property" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary-glow">
            {isEdit ? 'Update' : 'Create'} Schema
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>JSON Preview</CardTitle>
            <CardDescription>This is what will be sent to your backend</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(generatePreview(), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};