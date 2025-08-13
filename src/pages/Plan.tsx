import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAMPLE_RECIPES, Recipe, getAlternatives } from "@/lib/recipes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Shuffle, ShoppingCart } from "lucide-react";

type DietTag = Recipe["dietary"][number];

type Profile = {
  goals: string[];
  diets: DietTag[];
  ratings: Record<string, number>;
  household: number;
  style: "daily" | "clever" | "weekend";
} | null;

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem("tellerplan_profile");
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

const Plan = () => {
  const navigate = useNavigate();
  const profile = loadProfile();
  const [days, setDays] = useState<string>("5");
  const basePool = useMemo(() => {
    if (!profile) return SAMPLE_RECIPES;
    const likedCuisines = Object.entries(profile.ratings || {})
      .filter(([, v]) => (v as number) >= 3)
      .map(([k]) => k);
    return SAMPLE_RECIPES.filter((r) =>
      (!profile.diets?.length || (profile.diets as DietTag[]).every((d) => r.dietary.includes(d))) &&
      (!likedCuisines.length || likedCuisines.includes(r.cuisine))
    );
  }, [profile]);

  const [plan, setPlan] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!profile) {
      navigate("/onboarding");
      return;
    }
    const count = Number(days);
    const selection = [...basePool].slice(0, Math.max(3, count));
    setPlan(selection.slice(0, count));
  }, [basePool, days, profile, navigate]);

  const swapAt = (idx: number, withRecipe: Recipe) => {
    setPlan((p) => p.map((r, i) => (i === idx ? withRecipe : r)));
  };

  const goShopping = () => {
    localStorage.setItem("tellerplan_plan", JSON.stringify(plan));
    navigate("/shopping");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your Weekly Meal Plan | Tellerplan</title>
        <meta name="description" content="A visual weekly plan you can tweak—swap meals, change days, and generate your shopping list." />
        <link rel="canonical" href="/plan" />
      </Helmet>

      <section className="container py-8 md:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Your weekly plan</h1>
            <p className="text-muted-foreground">Tailored to your tastes. Adjust anything.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Days" />
              </SelectTrigger>
              <SelectContent>
                {["3","4","5","6","7"].map((d) => (
                  <SelectItem key={d} value={d}>{d} days</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="hero" onClick={goShopping}><ShoppingCart className="mr-2" /> Generate shopping list</Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plan.map((r, i) => (
            <Card key={r.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Day {i + 1}: {r.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{r.cuisine} • {r.time} min • {r.difficulty}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {r.dietary.map((t) => (
                    <span key={t} className="rounded-full bg-accent px-2 py-1 text-accent-foreground">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="subtle"><Shuffle className="mr-2" /> Swap</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Swap with</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3">
                        {getAlternatives(r, basePool).map((alt) => (
                          <button
                            key={alt.id}
                            className="text-left p-3 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => {
                              swapAt(i, alt);
                              toast(`Replaced with ${alt.title}`);
                            }}
                          >
                            <div className="font-medium">{alt.title}</div>
                            <div className="text-sm text-muted-foreground">{alt.time} min • {alt.difficulty}</div>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/onboarding" className="text-sm text-muted-foreground underline">Refine my preferences</Link>
        </div>
      </section>
    </div>
  );
};

export default Plan;
