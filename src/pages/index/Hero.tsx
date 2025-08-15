import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shuffle, ShoppingCart } from "lucide-react";
import heroImage from "@/assets/hero-tellerplan.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation('landing');
  return (
    <section className="container grid md:grid-cols-2 gap-10 items-center py-10 md:py-20">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-4 w-4" /> {t('hero.badge')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          {t('hero.h1')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('hero.p')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/onboarding">
            <Button variant="hero" size="xl">
              {t('hero.ctaCreate')} <ArrowRight className="ml-1" />
            </Button>
          </Link>
          <Link to="/plan">
            <Button variant="subtle" size="xl">
              {t('hero.ctaDemo')}
            </Button>
          </Link>
        </div>
        <ul className="grid sm:grid-cols-3 gap-2 text-sm text-foreground/80">
          <li className="flex items-center gap-2"><Shuffle className="h-4 w-4" /> {t('hero.bullets.swap')}</li>
          <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {t('hero.bullets.list')}</li>
          <li className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> {t('hero.bullets.prices')}</li>
        </ul>
      </div>
      <div className="relative">
        <img src={heroImage} alt={t('hero.imageAlt')} loading="lazy" className="rounded-lg shadow-lg" />
        <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: "radial-gradient(800px circle at 20% 10%, hsl(var(--brand) / 0.12), transparent 40%)" }} />
      </div>
    </section>
  );
};

export default Hero;
