'use client';

import * as React from 'react';
import { useT } from './I18nProvider';

export default function NavToggle({ navId }: { navId: string }) {
  const [open, setOpen] = React.useState(false);
  const t = useT();

  React.useEffect(() => {
    const body = document.body;
    if (open) body.classList.add('navOpen');
    else body.classList.remove('navOpen');
    return () => body.classList.remove('navOpen');
  }, [open]);

  React.useEffect(() => {
    const nav = document.getElementById(navId);
    if (!nav) return;
    if (open) nav.classList.add('isOpen');
    else nav.classList.remove('isOpen');

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a')) setOpen(false);
    };
    nav.addEventListener('click', onClick);
    return () => nav.removeEventListener('click', onClick);
  }, [open, navId]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <button
      type="button"
      className="navToggle"
      aria-label={open ? t('actions.closeMenu') : t('actions.openMenu')}
      aria-controls={navId}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="navToggleIcon" aria-hidden="true" />
    </button>
  );
}
