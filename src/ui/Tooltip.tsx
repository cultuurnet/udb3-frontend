import { OverlayTrigger } from 'react-bootstrap';
import { Tooltip as BootstrapTooltip } from 'react-bootstrap';

import { QuestionCircleIcon } from '@/pages/NewFeatureTooltip';

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  id: string;
  tooltip: string;
  placement: TooltipPlacement;
};

const Tooltip = ({ id, tooltip, placement }: Props) => {
  return (
    <OverlayTrigger
      overlay={<BootstrapTooltip id={id}>{tooltip}</BootstrapTooltip>}
      placement={placement}
    >
      <span>
        <QuestionCircleIcon />
      </span>
    </OverlayTrigger>
  );
};

export { Tooltip };
