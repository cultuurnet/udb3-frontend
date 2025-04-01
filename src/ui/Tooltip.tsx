import { OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap';
import { Tooltip as BootstrapTooltip } from 'react-bootstrap';

import { QuestionCircleIcon } from '@/pages/NewFeatureTooltip';

type Props = {
  id: string;
  content: string;
} & Pick<OverlayTriggerProps, 'placement'>;

const Tooltip = ({ id, content, placement }: Props) => {
  return (
    <OverlayTrigger
      overlay={<BootstrapTooltip id={id}>{content}</BootstrapTooltip>}
      placement={placement}
    >
      <span>
        <QuestionCircleIcon />
      </span>
    </OverlayTrigger>
  );
};

export { Tooltip };
