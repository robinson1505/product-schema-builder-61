import React, { useState } from 'react';
import { SchemaList } from '@/components/SchemaList';
import { SchemaBuilder } from '@/components/SchemaBuilder';
import { SchemaViewer } from '@/components/SchemaViewer';
import { ProductSchema, CreateSchemaRequest } from '@/types/schema';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const Index = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSchema, setSelectedSchema] = useState<ProductSchema | null>(null);
  
  // Mock data - replace with your backend integration
  const [schemas, setSchemas] = useState<ProductSchema[]>([
    {
      id: '1',
      category: 'electronics',
      eventType: 'product_created',
      schema: {
        title: 'Electronics Product Schema',
        description: 'Schema for electronic products like phones, laptops, etc.',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Product name'
          },
          price: {
            type: 'number',
            description: 'Product price in USD'
          },
          brand: {
            type: 'string',
            description: 'Product brand'
          },
          inStock: {
            type: 'boolean',
            description: 'Whether the product is in stock'
          }
        },
        required: ['name', 'price', 'brand'],
        additionalProperties: false
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      category: 'clothing',
      eventType: 'product_updated',
      schema: {
        title: 'Clothing Product Schema',
        description: 'Schema for clothing items',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Clothing item name'
          },
          size: {
            type: 'string',
            description: 'Size of the clothing item'
          },
          color: {
            type: 'string',
            description: 'Primary color'
          },
          material: {
            type: 'string',
            description: 'Main material'
          },
          price: {
            type: 'number',
            description: 'Price in USD'
          }
        },
        required: ['name', 'size', 'price'],
        additionalProperties: true
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    }
  ]);

  const handleCreateSchema = (data: CreateSchemaRequest) => {
    const newSchema: ProductSchema = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSchemas([newSchema, ...schemas]);
    setViewMode('list');
    
    // Here you would send to your backend:
    // await fetch('/api/schemas', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    
    toast({
      title: "Schema Created",
      description: `"${data.schema.title}" has been successfully created.`,
    });
  };

  const handleEditSchema = (id: string, data: CreateSchemaRequest) => {
    setSchemas(schemas.map(schema => 
      schema.id === id 
        ? { ...schema, ...data, updatedAt: new Date() }
        : schema
    ));
    setViewMode('list');
    
    // Here you would update in your backend:
    // await fetch(`/api/schemas/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    
    toast({
      title: "Schema Updated",
      description: `"${data.schema.title}" has been successfully updated.`,
    });
  };

  const handleDeleteSchema = (id: string) => {
    setSchemas(schemas.filter(schema => schema.id !== id));
    
    // Here you would delete from your backend:
    // await fetch(`/api/schemas/${id}`, { method: 'DELETE' });
  };

  const handleViewSchema = (schema: ProductSchema) => {
    setSelectedSchema(schema);
    setViewMode('view');
  };

  const handleEditClick = (schema: ProductSchema) => {
    setSelectedSchema(schema);
    setViewMode('edit');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <SchemaBuilder
            onSave={handleCreateSchema}
            onCancel={() => setViewMode('list')}
          />
        );
      
      case 'edit':
        return selectedSchema ? (
          <SchemaBuilder
            initialSchema={selectedSchema}
            onSave={(data) => handleEditSchema(selectedSchema.id, data)}
            onCancel={() => setViewMode('list')}
            isEdit
          />
        ) : null;
      
      case 'view':
        return selectedSchema ? (
          <SchemaViewer
            schema={selectedSchema}
            onEdit={() => setViewMode('edit')}
            onBack={() => setViewMode('list')}
          />
        ) : null;
      
      default:
        return (
          <SchemaList
            schemas={schemas}
            onEdit={handleEditClick}
            onDelete={handleDeleteSchema}
            onView={handleViewSchema}
            onCreate={() => setViewMode('create')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
