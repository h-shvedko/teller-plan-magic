import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, ShoppingCart, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface ShoppingList {
  id: string;
  name: string;
  is_completed: boolean;
  meal_plan_id?: string;
  created_at: string;
  updated_at: string;
}

export const ShoppingLists = () => {
  const { user } = useAuth();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    is_completed: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadShoppingLists();
  }, [user]);

  const loadShoppingLists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShoppingLists(data || []);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shopping lists',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingList) {
        const { error } = await supabase
          .from('shopping_lists')
          .update(formData)
          .eq('id', editingList.id);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Shopping list updated successfully' });
      } else {
        const { error } = await supabase
          .from('shopping_lists')
          .insert({ ...formData, user_id: user.id });
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Shopping list created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadShoppingLists();
    } catch (error) {
      console.error('Error saving shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shopping list',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (list: ShoppingList) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      is_completed: list.is_completed
    });
    setDialogOpen(true);
  };

  const handleToggleComplete = async (list: ShoppingList) => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ is_completed: !list.is_completed })
        .eq('id', list.id);

      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: `Shopping list marked as ${!list.is_completed ? 'completed' : 'incomplete'}` 
      });
      loadShoppingLists();
    } catch (error) {
      console.error('Error updating shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shopping list',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shopping list?')) return;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Shopping list deleted successfully' });
      loadShoppingLists();
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shopping list',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      is_completed: false
    });
    setEditingList(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading shopping lists...</span>
        </div>
      </div>
    );
  }

  const completedLists = shoppingLists.filter(list => list.is_completed);
  const pendingLists = shoppingLists.filter(list => !list.is_completed);

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Shopping Lists</h1>
              </div>
              <p className="text-muted-foreground">Manage your grocery shopping lists</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Shopping List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingList ? 'Edit Shopping List' : 'Create New Shopping List'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingList ? 'Update your shopping list details' : 'Create a new shopping list'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">List Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Weekly Groceries"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_completed"
                      checked={formData.is_completed}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_completed: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_completed">Mark as completed</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingList ? 'Update' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shoppingLists.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingLists.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedLists.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Shopping Lists Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Shopping Lists</CardTitle>
              <CardDescription>
                {shoppingLists.length} shopping list{shoppingLists.length !== 1 ? 's' : ''} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shoppingLists.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shopping lists yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first shopping list to organize your grocery shopping
                  </p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Shopping List
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shoppingLists.map((list) => (
                      <TableRow key={list.id}>
                        <TableCell className="font-medium">{list.name}</TableCell>
                        <TableCell>
                          <Badge variant={list.is_completed ? 'default' : 'secondary'}>
                            {list.is_completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(list.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(list.updated_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleComplete(list)}
                              title={list.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {list.is_completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(list)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(list.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};