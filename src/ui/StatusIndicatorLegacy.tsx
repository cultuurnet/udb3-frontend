import { Box } from '@/ui/Box';
import { getInlineProps, Inline, InlineProps } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';

type Props = InlineProps & {
  color?: string;
  label?: string;
  description?: string;
};

export const StatusIndicatorLegacy = ({
  color,
  label,
  description,
  ...props
}: Props) => {
  return (
    <Stack>
      <Inline
        marginBottom={1}
        spacing={3}
        alignItems="center"
        {...getInlineProps(props)}
      >
        {color &&
          label && [
            <Box
              key="status-indicator-box"
              width="0.90rem"
              height="0.90rem"
              backgroundColor={color}
              borderRadius="50%"
              flexShrink={0}
            />,
            <Text key="status-indicator-label" variant={TextVariants.MUTED}>
              {label}
            </Text>,
          ]}
      </Inline>
      {description && <Text variant={TextVariants.MUTED}>{description}</Text>}
    </Stack>
  );
};
