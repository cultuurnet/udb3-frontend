import DOMPurify from 'isomorphic-dompurify';

import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

type Props = {
  description: string;
};

const dompurifySanitizeEventDescription = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['ul', 'ol', 'li', 'span', 'p', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['style', 'href'],
  });
};

const DescriptionPreview = ({ description }: Props) => {
  const getLinkThemeValue = getValueFromTheme('link');

  return (
    <Text
      css={`
        p {
          margin: 7.5px 0;
        }
        a {
          color: ${getLinkThemeValue('color')};
          text-decoration: underline;
          &:hover {
            color: ${getLinkThemeValue('hoverColor')};
          }
        }
        em {
          font-style: italic;
        }
        strong {
          font-weight: bold;
        }
        ul {
          list-style-type: disc;
          margin: 7.5px 0 7.5px 20px;
        }
        ol {
          list-style-type: decimal;
          margin: 7.5px 0 7.5px 20px;
        }
      `}
      dangerouslySetInnerHTML={{
        __html: dompurifySanitizeEventDescription(description),
      }}
    />
  );
};

export { DescriptionPreview, dompurifySanitizeEventDescription };
