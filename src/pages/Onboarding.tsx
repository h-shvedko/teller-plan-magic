import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const CUISINES = ["Italian", "Vietnamese", "Mexican", "German", "Indian"] as const;
const DIETS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Pescatarian"] as const;
const GOALS = ["Eat Healthier", "Explore Cuisines", "Save Money"] as const;

type CuisineRatings = Record<(typeof CUISINES)[number], number>;

const Onboarding = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<string[]>(["Explore Cuisines"]);
  const [diets, setDiets] = useState<string[]>([]);
  const [ratings, setRatings] = useState<CuisineRatings>({
    Italian: 5,
    Vietnamese: 4,
    Mexican: 4,
    German: 3,
    Indian: 3,
  });
  const [household, setHousehold] = useState("2");
  const [style, setStyle] = useState("daily");

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const onSubmit = () => {
    const profile = {
      goals,
      diets,
      ratings,
      household: Number(household),
      style, // daily | clever | weekend
    };
    localStorage.setItem("tellerplan_profile", JSON.stringify(profile));
    toast("Profile saved. Generating your plan…");
    navigate("/plan");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Onboarding | Tellerplan</title>
        <meta name="description" content="Tell us your tastes and goals to personalize your meal plan." />
        <link rel="canonical" href="/onboarding" />
      </Helmet>

      <section className="container py-10 md:py-16 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Let's tailor your plan</h1>
          <p className="text-muted-foreground mt-2">A quick chat to learn your tastes. You can change anything later.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {GOALS.map((g) => (
                <label key={g} className="flex items-center gap-3">
                  <Checkbox
                    checked={goals.includes(g)}
                    onCheckedChange={() => setGoals((prev) => toggleArray(prev, g))}
                    id={`goal-${g}`}
                  />
                  <span>{g}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {DIETS.map((d) => (
                <label key={d} className="flex items-center gap-3">
                  <Checkbox
                    checked={diets.includes(d)}
                    onCheckedChange={() => setDiets((prev) => toggleArray(prev, d))}
                    id={`diet-${d}`}
                  />
                  <span>{d}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuisine interests</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {CUISINES.map((c) => (
              <div key={c} className="grid gap-2">
                <Label htmlFor={`cuisine-${c}`} className="flex items-center justify-between">
                  <span>{c}</span>
                  <span className="text-muted-foreground text-sm">{ratings[c]} / 5</span>
                </Label>
                <Slider
                  id={`cuisine-${c}`}
                  value={[ratings[c]]}
                  max={5}
                  step={1}
                  onValueChange={([v]) => setRatings((r) => ({ ...r, [c]: v }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Household size</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Label>How many people are you cooking for?</Label>
              <Select value={household} onValueChange={setHousehold}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["1","2","3","4","5","6"].map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My cooking style</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <RadioGroup value={style} onValueChange={setStyle}>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="daily" id="daily" />
                  <div>
                    <Label htmlFor="daily">The Daily Chef</Label>
                    <p className="text-sm text-muted-foreground">One fresh recipe per day.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="clever" id="clever" />
                  <div>
                    <Label htmlFor="clever">The Clever Cook</Label>
                    <p className="text-sm text-muted-foreground">Cook once, eat twice with smart leftovers.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="weekend" id="weekend" />
                  <div>
                    <Label htmlFor="weekend">The Weekend Pro</Label>
                    <p className="text-sm text-muted-foreground">Batch-cook on Sunday, 10-min assemblies on weekdays.</p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="hero" size="lg" onClick={onSubmit}>Create my plan</Button>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;
