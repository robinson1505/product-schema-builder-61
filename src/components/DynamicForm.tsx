import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JSONSchema, SchemaProperty } from '@/types/schema';
import ReactMarkdown from 'react-markdown';

interface DynamicFormProps {
  schema: JSONSchema;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  multiStep?: boolean;
}

// Helper function to create Zod schema from JSON schema
const createZodSchema = (properties: Record<string, SchemaProperty>, required: string[] = []): z.ZodTypeAny => {
  const shape: Record<string, z.ZodTypeAny> = {};

  Object.entries(properties).forEach(([key, property]) => {
    let zodType: z.ZodTypeAny;

    switch (property.type) {
      case 'string':
        if (property.format === 'email') {
          zodType = z.string().email('Invalid email format');
        } else if (property.format === 'date' || property.format === 'date-time') {
          zodType = z.date();
        } else if (property.enum) {
          if (property.multiple) {
            zodType = z.array(z.string());
          } else {
            zodType = z.string();
          }
        } else {
          zodType = z.string();
        }
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'object':
        if (property.properties) {
          zodType = createZodSchema(property.properties, property.required);
        } else {
          zodType = z.object({});
        }
        break;
      case 'array':
        zodType = z.array(z.any());
        break;
      default:
        zodType = z.any();
    }

    if (!required.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  });

  return z.object(shape);
};

// Helper component to render form fields
const FormFieldRenderer: React.FC<{
  name: string;
  property: SchemaProperty;
  control: any;
  parentPath?: string;
}> = ({ name, property, control, parentPath = '' }) => {
  const fieldPath = parentPath ? `${parentPath}.${name}` : name;

  const renderInput = (field: any) => {
    switch (property.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
            <span className="text-sm">{property.description}</span>
          </div>
        );

      case 'string':
        // Date picker
        if (property.format === 'date' || property.format === 'date-time') {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          );
        }

        // Select dropdown with enum options
        if (property.enum && property.enum.length > 0) {
          if (property.multiple) {
            // Multiple select with checkboxes
            return (
              <div className="space-y-2">
                {property.enum.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      checked={(field.value || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        if (checked) {
                          field.onChange([...currentValues, option]);
                        } else {
                          field.onChange(currentValues.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <label className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            );
          } else {
            // Single select dropdown
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {property.enum.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }
        }

        // Markdown editor
        if (property.format === 'markdown') {
          return (
            <div className="space-y-2">
              <Textarea
                {...field}
                placeholder="Enter markdown content..."
                rows={6}
                className="font-mono"
              />
              {field.value && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm font-medium mb-2">Preview:</div>
                  <ReactMarkdown>
                    {field.value}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        }

        // Large text area
        if (property.format === 'textarea' || (property.description && property.description.length > 50)) {
          return (
            <Textarea
              {...field}
              placeholder={property.description}
              rows={4}
            />
          );
        }
        
        // Regular text input
        return (
          <Input
            {...field}
            type={property.format === 'email' ? 'email' : 'text'}
            placeholder={property.description}
          />
        );

      case 'number':
        return (
          <Input
            {...field}
            type="number"
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            placeholder={property.description}
          />
        );

      case 'object':
        if (!property.properties) return null;
        
        return (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm">{name} Properties</h4>
            {Object.entries(property.properties).map(([nestedName, nestedProperty]) => (
              <FormFieldRenderer
                key={nestedName}
                name={nestedName}
                property={nestedProperty}
                control={control}
                parentPath={fieldPath}
              />
            ))}
          </div>
        );

      default:
        return (
          <Input
            {...field}
            placeholder={property.description}
          />
        );
    }
  };

  if (property.type === 'object' && property.properties) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">{name}</h3>
        {Object.entries(property.properties).map(([nestedName, nestedProperty]) => (
          <FormField
            key={nestedName}
            control={control}
            name={`${fieldPath}.${nestedName}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{nestedName}</FormLabel>
                <FormControl>
                  {renderInput({ ...field, value: field.value || '' })}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <FormField
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{name}</FormLabel>
          <FormControl>
            {renderInput({ ...field, value: field.value || '' })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  multiStep = false,
}) => {
  const zodSchema = createZodSchema(schema.properties, schema.required);
  const [currentStep, setCurrentStep] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    onSubmit(data);
  };

  // Divide properties into steps for multi-step forms
  const propertyEntries = Object.entries(schema.properties);
  const stepsCount = multiStep ? Math.ceil(propertyEntries.length / 3) : 1;
  const currentStepProperties = multiStep 
    ? propertyEntries.slice(currentStep * 3, (currentStep + 1) * 3)
    : propertyEntries;

  const handleNext = () => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {schema.title} - Data Input Form
          {multiStep && ` (Step ${currentStep + 1} of ${stepsCount})`}
        </CardTitle>
        <CardDescription>{schema.description}</CardDescription>
        {multiStep && (
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / stepsCount) * 100}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {currentStepProperties.map(([name, property]) => (
              <FormFieldRenderer
                key={name}
                name={name}
                property={property}
                control={form.control}
              />
            ))}
            
            <div className="flex justify-between space-x-2">
              <div className="flex space-x-2">
                {multiStep && currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {multiStep && currentStep < stepsCount - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
                    Submit Data
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};