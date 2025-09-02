import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("landing");
  const current = (i18n.language || "en").split("-")[0];

  return (
    <Select value={current} onValueChange={(lng) => i18n.changeLanguage(lng)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={t("lang.label", "Language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
