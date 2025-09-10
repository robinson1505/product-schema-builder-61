import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { SchemaProperty } from '@/types/schema';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PropertyBuilderProps {
  name: string;
  property: SchemaProperty;
  isRequired: boolean;
  onUpdate: (property: SchemaProperty) => void;
  onRemove: () => void;
  onToggleRequired: () => void;
  onRename: (newName: string) => void;
  depth?: number;
}

const formatOptions = [
  { value: 'none', label: 'None' },
  { value: 'date', label: 'Date' },
  { value: 'date-time', label: 'Date Time' },
  { value: 'time', label: 'Time' },
  { value: 'email', label: 'Email' },
  { value: 'uri', label: 'URI' },
  { value: 'uuid', label: 'UUID' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'textarea', label: 'Text Area' },
];

export const PropertyBuilder: React.FC<PropertyBuilderProps> = ({
  name,
  property,
  isRequired,
  onUpdate,
  onRemove,
  onToggleRequired,
  onRename,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const addNestedProperty = () => {
    const newPropertyName = `property_${Object.keys(property.properties || {}).length + 1}`;
    const newProperties = {
      ...(property.properties || {}),
      [newPropertyName]: {
        type: 'string' as const,
        description: '',
      },
    };
    onUpdate({
      ...property,
      properties: newProperties,
    });
  };

  const updateNestedProperty = (propName: string, nestedProperty: SchemaProperty) => {
    const newProperties = {
      ...(property.properties || {}),
      [propName]: nestedProperty,
    };
    onUpdate({
      ...property,
      properties: newProperties,
    });
  };

  const removeNestedProperty = (propName: string) => {
    const newProperties = { ...(property.properties || {}) };
    delete newProperties[propName];
    const newRequired = (property.required || []).filter(req => req !== propName);
    onUpdate({
      ...property,
      properties: newProperties,
      required: newRequired,
    });
  };

  const toggleNestedRequired = (propName: string) => {
    const currentRequired = property.required || [];
    const newRequired = currentRequired.includes(propName)
      ? currentRequired.filter(req => req !== propName)
      : [...currentRequired, propName];
    onUpdate({
      ...property,
      required: newRequired,
    });
  };

  const renameNestedProperty = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return;
    
    const newProperties = { ...(property.properties || {}) };
    newProperties[newName] = newProperties[oldName];
    delete newProperties[oldName];

    const currentRequired = property.required || [];
    const newRequired = currentRequired.includes(oldName)
      ? currentRequired.map(req => req === oldName ? newName : req)
      : currentRequired;

    onUpdate({
      ...property,
      properties: newProperties,
      required: newRequired,
    });
  };

  const marginLeft = depth * 24;

  return (
    <div className="border rounded-lg space-y-4" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <Input
              value={name}
              onChange={(e) => onRename(e.target.value)}
              placeholder="Property name"
              className="font-medium"
              disabled={false}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Required</Label>
            <Switch
              checked={isRequired}
              onCheckedChange={onToggleRequired}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={property.type}
              onValueChange={(value: any) => 
                onUpdate({ ...property, type: value, properties: value === 'object' ? property.properties : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(property.type === 'string' || property.type === 'number') && (
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={property.format || 'none'}
                onValueChange={(value) => 
                  onUpdate({ ...property, format: value === 'none' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={property.description || ''}
              onChange={(e) =>
                onUpdate({ ...property, description: e.target.value })
              }
              placeholder="Property description"
            />
          </div>

          {property.type === 'string' && (
            <div className="space-y-2">
              <Label>Multiple Selection</Label>
              <Switch
                checked={property.multiple || false}
                onCheckedChange={(checked) =>
                  onUpdate({ ...property, multiple: checked })
                }
              />
            </div>
          )}
        </div>

        {/* Enum options for select dropdowns */}
        {property.type === 'string' && property.enum && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEnum = [...(property.enum || []), ''];
                  onUpdate({ ...property, enum: newEnum });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {property.enum.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newEnum = [...property.enum!];
                      newEnum[index] = e.target.value;
                      onUpdate({ ...property, enum: newEnum });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newEnum = property.enum!.filter((_, i) => i !== index);
                      onUpdate({ ...property, enum: newEnum.length > 0 ? newEnum : undefined });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add enum options button */}
        {property.type === 'string' && !property.enum && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ ...property, enum: [''] })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Select Options
            </Button>
          </div>
        )}
      </div>

      {property.type === 'object' && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="px-4 pb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Nested Properties ({Object.keys(property.properties || {}).length})</span>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4">
              {Object.entries(property.properties || {}).map(([propName, nestedProperty]) => (
                <PropertyBuilder
                  key={propName}
                  name={propName}
                  property={nestedProperty}
                  isRequired={(property.required || []).includes(propName)}
                  onUpdate={(updatedProperty) => updateNestedProperty(propName, updatedProperty)}
                  onRemove={() => removeNestedProperty(propName)}
                  onToggleRequired={() => toggleNestedRequired(propName)}
                  onRename={(newName) => renameNestedProperty(propName, newName)}
                  depth={depth + 1}
                />
              ))}
              
              <Button onClick={addNestedProperty} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Nested Property
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};