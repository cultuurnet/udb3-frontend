import { Text } from '@/ui/Text';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

type Props = {
  description: string;
};

// TODO: remove !-overrides when GlobalStyle.js's `font: inherit` / `list-style: none` resets are cleaned up.
const richTextClassName = [
  'tw:[&_p]:my-[7.5px]',
  'tw:[&_a]:underline',
  'tw:[&_a]:text-udb-main-darkest-blue',
  'tw:[&_a:hover]:text-udb-main-blue',
  'tw:[&_em]:italic!',
  'tw:[&_strong]:font-bold!',
  'tw:[&_ul]:[margin:7.5px_0_7.5px_20px]',
  'tw:[&_ol]:[margin:7.5px_0_7.5px_20px]',
  'tw:[&_ul]:list-disc!',
  'tw:[&_ol]:list-decimal!',
].join(' ');

const DescriptionPreview = ({ description }: Props) => {
  return (
    <Text
      className={richTextClassName}
      dangerouslySetInnerHTML={{
        __html: sanitizeDom(description, sanitizationPresets.EVENT_DESCRIPTION),
      }}
    />
  );
};

export { DescriptionPreview };
