import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityChartProps {
  data: Array<{
    week: string;
    mealPlans: number;
    recipes: number;
    shoppingLists: number;
  }>;
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Your meal planning activity over the last 8 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mealPlans" 
              stroke="hsl(var(--primary))" 
              name="Meal Plans"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="recipes" 
              stroke="hsl(var(--secondary))" 
              name="Recipes"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="shoppingLists" 
              stroke="hsl(var(--accent))" 
              name="Shopping Lists"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};