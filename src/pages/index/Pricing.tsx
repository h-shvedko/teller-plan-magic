import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  const { t } = useTranslation('landing');
  return (
    <section className="border-t border-border">
      <div className="container py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-semibold">{t('pricing.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('pricing.subtitle')}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <article className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{t('pricing.free.title')}</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{t('pricing.free.price')}</span>
              <span className="text-muted-foreground">{t('pricing.free.period')}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {(t('pricing.free.features', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" /><span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/onboarding"><Button variant="subtle" size="sm">{t('pricing.free.cta')}</Button></Link>
            </div>
          </article>

          <article className="rounded-lg border bg-card p-6 shadow-sm ring-1 ring-primary/20">
            <h3 className="text-lg font-semibold">{t('pricing.pro.title')}</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{t('pricing.pro.price')}</span>
              <span className="text-muted-foreground">{t('pricing.pro.period')}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {(t('pricing.pro.features', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" /><span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/onboarding"><Button variant="hero" size="sm">{t('pricing.pro.cta')}</Button></Link>
            </div>
          </article>

          <article className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{t('pricing.family.title')}</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{t('pricing.family.price')}</span>
              <span className="text-muted-foreground">{t('pricing.family.period')}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {(t('pricing.family.features', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" /><span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/onboarding"><Button variant="subtle" size="sm">{t('pricing.family.cta')}</Button></Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
