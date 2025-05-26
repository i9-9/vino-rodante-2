import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const locales = ['en', 'es'] as const;
type Locale = typeof locales[number];

const languageNames: Record<Locale, { native: string }> = {
  en: { native: 'English' },
  es: { native: 'Español' },
};

const LanguageToggle: React.FC = () => {
  const locale = 'en' as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    // Implement the logic to change the locale
  };

  return (
    <div className="flex space-x-2">
      {locales.map((loc) => (
        <Button 
          key={loc} 
          variant="ghost"
          className={cn(
            "px-2 h-7 text-sm",
            loc === locale && "font-bold",
          )}
          onClick={() => handleLocaleChange(loc)}
        >
          {languageNames[loc].native}
        </Button>
      ))}
    </div>
  );
};

export default LanguageToggle; 