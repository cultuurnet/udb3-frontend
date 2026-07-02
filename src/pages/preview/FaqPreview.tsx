import i18n, { SupportedLanguage } from '@/i18n/index';
import { FaqItem, Offer } from '@/types/Offer';
import { Accordion } from '@/ui/Accordion';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { sanitizationPresets, sanitizeDom } from '@/utils/sanitizeDom';

type Props = {
  faqs?: FaqItem[];
  mainLanguage?: Offer['mainLanguage'];
};

const FaqPreview = ({ faqs, mainLanguage }: Props) => {
  const items = (faqs ?? [])
    .map((faq) =>
      getLanguageObjectOrFallback<FaqItem[SupportedLanguage]>(
        faq,
        i18n.language as SupportedLanguage,
        mainLanguage,
      ),
    )
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <Accordion>
      {items.map((item, index) => (
        <Accordion.Item key={index} eventKey={`${index}`} title={item.question}>
          <Text
            dangerouslySetInnerHTML={{
              __html: sanitizeDom(
                item.answer,
                sanitizationPresets.EVENT_DESCRIPTION,
              ),
            }}
          />
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export { FaqPreview };
