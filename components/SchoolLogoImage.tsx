'use client';

import * as React from 'react';
import { getSchoolLogoPlaceholder } from '../lib/schoolLogo';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  schoolName: string;
};

export default function SchoolLogoImage({ schoolName, src, ...props }: Props) {
  const fallback = React.useMemo(() => getSchoolLogoPlaceholder(schoolName), [schoolName]);
  const [currentSrc, setCurrentSrc] = React.useState(typeof src === 'string' && src.trim() ? src : fallback);

  React.useEffect(() => {
    setCurrentSrc(typeof src === 'string' && src.trim() ? src : fallback);
  }, [src, fallback]);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth < 48 || img.naturalHeight < 48) {
          if (currentSrc !== fallback) setCurrentSrc(fallback);
        }
      }}
    />
  );
}
