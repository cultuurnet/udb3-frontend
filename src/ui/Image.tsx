import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { ImageLegacy } from './ImageLegacy';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
};

const ImageShadcn = ({
  src,
  alt,
  width,
  height,
  className,
  loading,
  decoding,
}: Props) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading={loading}
    decoding={decoding}
  />
);

const Image = (props: Props) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  return isShadcnMigrationEnabled ? (
    <ImageShadcn {...props} />
  ) : (
    <ImageLegacy {...props} />
  );
};

export type { Props as ImageProps };
export { Image };
