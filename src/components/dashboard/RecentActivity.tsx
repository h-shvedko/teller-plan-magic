import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChefHat, ShoppingCart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  data: Array<{
    type: 'meal_plan' | 'recipe' | 'shopping_list';
    name: string;
    date: string;
  }>;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'meal_plan':
      return <Calendar className="h-4 w-4" />;
    case 'recipe':
      return <ChefHat className="h-4 w-4" />;
    case 'shopping_list':
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'meal_plan':
      return 'Meal Plan';
    case 'recipe':
      return 'Recipe';
    case 'shopping_list':
      return 'Shopping List';
    default:
      return type;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'meal_plan':
      return 'default';
    case 'recipe':
      return 'secondary';
    case 'shopping_list':
      return 'outline';
    default:
      return 'default';
  }
};

export const RecentActivity = ({ data }: RecentActivityProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>No recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Start creating meal plans, recipes, or shopping lists to see your activity here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest meal planning activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((activity, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-3">
              {getIcon(activity.type)}
              <div>
                <p className="font-medium">{activity.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeColor(activity.type) as "default" | "secondary" | "destructive" | "outline"}>
                    {getTypeLabel(activity.type)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};