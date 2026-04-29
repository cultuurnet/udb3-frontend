import { Box } from './Box';
import { colors } from './theme';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
};

const SwitchButton = ({ checked, onChange, disabled, label }: Props) => {
  const track = (
    <Box
      forwardedAs="button"
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      css={`
        display: inline-flex;
        align-items: center;
        width: 2.5rem;
        height: 1.4rem;
        border-radius: 1rem;
        border: none;
        padding: 0.15rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        background-color: ${checked
          ? colors.udbMainPositiveGreen
          : colors.udbMainLightGrey};

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:focus-visible {
          outline: 2px solid ${colors.udbMainBlue};
          outline-offset: 2px;
        }
      `}
    >
      <Box
        forwardedAs="span"
        css={`
          display: block;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background-color: ${colors.white};
          transition: transform 0.2s ease;
          transform: ${checked ? 'translateX(1.1rem)' : 'translateX(0)'};
        `}
      />
    </Box>
  );

  if (!label) return track;

  return (
    <Box
      forwardedAs="label"
      css={`
        display: inline-flex;
        align-items: stretch;
        gap: 0.5rem;
        cursor: pointer;
        font-weight: ${checked ? 'bold' : 'normal'};
      `}
    >
      {track}
      <span>{label}</span>
    </Box>
  );
};

export { SwitchButton };
