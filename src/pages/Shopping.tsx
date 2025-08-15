import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Ingredient, Recipe } from "@/lib/recipes";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function loadPlan(): Recipe[] {
  try {
    const raw = localStorage.getItem("tellerplan_plan");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function aggregate(plan: Recipe[]) {
  const map = new Map<string, { quantity: number; unit: string; aisle: string }>();
  for (const r of plan) {
    for (const ing of r.ingredients) {
      const key = `${ing.name}|${ing.unit}`;
      const current = map.get(key) || { quantity: 0, unit: ing.unit, aisle: ing.aisle };
      current.quantity += ing.quantity;
      map.set(key, current);
    }
  }
  const items = Array.from(map.entries()).map(([k, v]) => {
    const [name] = k.split("|");
    return { name, ...v } as Ingredient;
  });

  const byAisle: Record<string, Ingredient[]> = {};
  for (const item of items) {
    if (!byAisle[item.aisle]) {
      byAisle[item.aisle] = [];
    }
    byAisle[item.aisle].push(item);
  }
  return byAisle;
}

const Shopping = () => {
  const navigate = useNavigate();
  const plan = loadPlan();
  const byAisle = useMemo(() => aggregate(plan), [plan]);

  useEffect(() => {
    if (!plan.length) {
      toast("Create a plan first.");
      navigate("/plan");
    }
  }, [plan.length, navigate]);

  const comparePrices = () => {
    toast("Price comparison requires integrations. Connect Supabase and a data provider to enable this.");
  };

  if (!plan.length) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <Helmet>
        <title>Shopping List | Tellerplan</title>
        <meta name="description" content="Combined, categorized shopping list generated from your weekly plan." />
        <link rel="canonical" href="/shopping" />
      </Helmet>

      <section className="container py-8 md:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Your shopping list</h1>
            <p className="text-muted-foreground">Automatically combined and sorted by aisle.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="subtle" onClick={comparePrices}>Find the best prices</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(byAisle).map(([aisle, items]) => (
            <Card key={aisle}>
              <CardHeader>
                <CardTitle>{aisle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((i) => (
                  <div key={`${i.name}-${i.unit}`} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{i.name}</span>
                    <span className="text-muted-foreground">{i.quantity} {i.unit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shopping;
