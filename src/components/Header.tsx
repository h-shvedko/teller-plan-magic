import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  showGetStarted?: boolean;
}

export const Header = ({ showGetStarted = true }: HeaderProps) => {
  const { t } = useTranslation('landing');
  const { user } = useAuth();

  return (
    <header className="container py-6 flex items-center justify-between">
      <Link to="/" className="inline-flex items-center gap-2">
        <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
        <span className="text-lg font-semibold">{t('brand.name')}</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/onboarding" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
          {t('nav.how')}
        </Link>
        <Link to="/plan" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
          {t('nav.demo')}
        </Link>
        {user && (
          <Link to="/dashboard" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Dashboard
          </Link>
        )}
        {!user && showGetStarted && (
          <Link to="/onboarding">
            <Button variant="hero" size="sm">{t('nav.getStarted')}</Button>
          </Link>
        )}
        <LanguageSwitcher />
        <UserMenu />
      </nav>
    </header>
  );
};