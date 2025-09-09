import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Eye, Search, Plus } from 'lucide-react';
import { ProductSchema } from '@/types/schema';
import { useToast } from '@/hooks/use-toast';

interface SchemaListProps {
  schemas: ProductSchema[];
  onEdit: (schema: ProductSchema) => void;
  onDelete: (id: string) => void;
  onView: (schema: ProductSchema) => void;
  onCreate: () => void;
}

export const SchemaList: React.FC<SchemaListProps> = ({
  schemas,
  onEdit,
  onDelete,
  onView,
  onCreate,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSchemas = schemas.filter(schema =>
    schema.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schema.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schema.schema.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    onDelete(id);
    toast({
      title: "Schema Deleted",
      description: `"${title}" has been successfully deleted.`,
    });
  };

  const getPropertyCount = (schema: ProductSchema) => {
    return Object.keys(schema.schema.properties).length;
  };

  const getRequiredCount = (schema: ProductSchema) => {
    return schema.schema.required.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Schema Manager
          </h1>
          <p className="text-muted-foreground">
            Create and manage product schemas for your backend
          </p>
        </div>
        <Button onClick={onCreate} className="bg-gradient-to-r from-primary to-primary-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Schema
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search schemas by category, event type, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{schemas.length}</div>
            <div className="text-sm text-muted-foreground">Total Schemas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {new Set(schemas.map(s => s.category)).size}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {schemas.reduce((acc, s) => acc + Object.keys(s.schema.properties).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Properties</div>
          </CardContent>
        </Card>
      </div>

      {/* Schema Grid */}
      {filteredSchemas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              {schemas.length === 0 ? (
                <>
                  <div className="text-4xl mb-2">📝</div>
                  <h3 className="text-lg font-medium mb-2">No schemas created yet</h3>
                  <p>Get started by creating your first product schema</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">🔍</div>
                  <h3 className="text-lg font-medium mb-2">No schemas found</h3>
                  <p>Try adjusting your search criteria</p>
                </>
              )}
            </div>
            {schemas.length === 0 && (
              <Button onClick={onCreate} className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create First Schema
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemas.map((schema) => (
            <Card key={schema.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {schema.schema.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {schema.schema.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border">
                      <DropdownMenuItem onClick={() => onView(schema)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(schema)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Schema
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Schema
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Schema</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{schema.schema.title}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(schema.id, schema.schema.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {schema.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {schema.eventType}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-primary">{getPropertyCount(schema)}</div>
                    <div className="text-muted-foreground">Properties</div>
                  </div>
                  <div>
                    <div className="font-medium text-success">{getRequiredCount(schema)}</div>
                    <div className="text-muted-foreground">Required</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created: {new Date(schema.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};