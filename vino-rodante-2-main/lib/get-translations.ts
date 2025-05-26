import { cookies } from 'next/headers';
import { es } from './i18n/es';
import { en } from './i18n/en';

export async function getTranslations() {
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'es';
  return language === 'es' ? es : en;
} 