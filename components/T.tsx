'use client';

import { useT } from './I18nProvider';

export default function T({
  k,
  values,
}: {
  k: string;
  values?: Record<string, string | number>;
}) {
  const t = useT();
  return <>{t(k, values)}</>;
}
