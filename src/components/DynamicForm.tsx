import React from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JSONSchema, SchemaProperty } from '@/types/schema';

interface DynamicFormProps {
  schema: JSONSchema;
  onSubmit: (data: any) => void;
  onCancel: () => void;
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
        
        if (property.description && property.description.length > 50) {
          return (
            <Textarea
              {...field}
              placeholder={property.description}
              rows={3}
            />
          );
        }
        
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
}) => {
  const zodSchema = createZodSchema(schema.properties, schema.required);
  
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title} - Data Input Form</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {Object.entries(schema.properties).map(([name, property]) => (
              <FormFieldRenderer
                key={name}
                name={name}
                property={property}
                control={form.control}
              />
            ))}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
                Submit Data
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};