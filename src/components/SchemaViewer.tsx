import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Copy, CheckCircle, FileText, Eye, EyeOff } from 'lucide-react';
import { ProductSchema } from '@/types/schema';
import { useToast } from '@/hooks/use-toast';
import { DynamicForm } from './DynamicForm';

interface SchemaViewerProps {
  schema: ProductSchema;
  onEdit: () => void;
  onBack: () => void;
  onDataSubmit?: (data: any) => void;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({
  schema,
  onEdit,
  onBack,
  onDataSubmit,
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showMultiStepForm, setShowMultiStepForm] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderPropertyDetails = (property: any, name: string, level = 0) => {
    const indent = level * 16;
    
    return (
      <div key={name} className="space-y-2" style={{ marginLeft: `${indent}px` }}>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h4 className="font-medium">{name}</h4>
              <Badge variant="outline" className="text-xs">
                {formatPropertyType(property.type)}
              </Badge>
              {property.format && (
                <Badge variant="secondary" className="text-xs">
                  {property.format}
                </Badge>
              )}
              {schema.schema.required.includes(name) && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
          
          {property.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {property.description}
            </p>
          )}

          {property.enum && property.enum.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Allowed values: </span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {property.enum.join(', ')}
              </span>
            </div>
          )}

          {property.type === 'array' && property.items && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Array items type: </span>
              <Badge variant="outline" className="text-xs">
                {formatPropertyType(property.items.type)}
              </Badge>
              {property.items.format && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {property.items.format}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {property.type === 'object' && property.properties && (
          <div className="ml-4 space-y-2">
            <h5 className="font-medium text-sm text-muted-foreground">Nested Properties:</h5>
            {Object.entries(property.properties).map(([nestedName, nestedProperty]: [string, any]) =>
              renderPropertyDetails(nestedProperty, nestedName, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const fullSchemaObject = {
    category: schema.category,
    eventType: schema.eventType,
    schema: schema.schema,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{schema.schema.title}</h1>
            <p className="text-muted-foreground">Schema Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {showForm ? 'Hide' : 'Show'} Form
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMultiStepForm(!showMultiStepForm)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {showMultiStepForm ? 'Hide' : 'Show'} Multi-Step
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(JSON.stringify(fullSchemaObject, null, 2), 'Schema')}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy JSON
          </Button>
          <Button onClick={onEdit} className="bg-gradient-to-r from-primary to-primary-glow">
            <Edit className="h-4 w-4 mr-2" />
            Edit Schema
          </Button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <DynamicForm
          schema={schema.schema}
          onSubmit={(data) => {
            console.log('Data submitted for schema:', schema.id, data);
            onDataSubmit?.(data);
            toast({
              title: "Data Submitted",
              description: "Form data has been processed successfully",
            });
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Multi-Step Form Section */}
      {showMultiStepForm && (
        <DynamicForm
          schema={schema.schema}
          multiStep={true}
          onSubmit={(data) => {
            console.log('Multi-step data submitted for schema:', schema.id, data);
            onDataSubmit?.(data);
            toast({
              title: "Multi-Step Data Submitted",
              description: "Form data has been processed successfully",
            });
          }}
          onCancel={() => setShowMultiStepForm(false)}
        />
      )}

      {showDetails && (
        <>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {schema.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {schema.eventType}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">
                    {schema.schema.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Type</div>
                  <div className="text-primary font-medium">{schema.schema.type}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Properties</div>
                  <div className="text-primary font-medium">
                    {Object.keys(schema.schema.properties).length}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Required Fields</div>
                  <div className="text-success font-medium">{schema.schema.required.length}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Additional Properties</div>
                  <div className="flex items-center space-x-1">
                    {schema.schema.additionalProperties ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className="text-sm">
                      {schema.schema.additionalProperties ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Schema properties and their definitions (including nested properties)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(schema.schema.properties).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No properties defined for this schema
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(schema.schema.properties).map(([name, property]) =>
                    renderPropertyDetails(property, name)
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* JSON Output */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>JSON Schema Output</CardTitle>
                <CardDescription>
                  Complete schema object that will be sent to your backend
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(fullSchemaObject, null, 2), 'Schema')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(fullSchemaObject, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Created</label>
                  <p>{new Date(schema.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Last Updated</label>
                  <p>{new Date(schema.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};