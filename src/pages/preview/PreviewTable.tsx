import type { ReactNode } from 'react';

import { colors } from '@/ui/theme';

type Props = {
  children: ReactNode;
};

const PreviewTable = ({ children }: Props) => (
  <table
    css={`
      width: 100%;

      td {
        padding-left: 0 !important;
        border-bottom: 1px solid ${colors.grey3};
      }
      tr:first-child td {
        padding-top: 0;
      }
      td:first-child {
        color: ${colors.grey5};
      }
      tr:last-child td {
        border-bottom: none;
      }
    `}
  >
    <tbody>{children}</tbody>
  </table>
);

export { PreviewTable };
