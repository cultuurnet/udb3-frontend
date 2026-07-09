import type { Values } from '@/types/Values';

import type { ContentModalProps } from './Modal/ContentModal';
import { ContentModal } from './Modal/ContentModal';
import type { QuestionModalProps } from './Modal/QuestionModal';
import { QuestionModal } from './Modal/QuestionModal';

const ModalVariants = {
  QUESTION: 'question',
  CONTENT: 'content',
} as const;

const ModalSizes = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

const Components = {
  [ModalVariants.QUESTION]: QuestionModal,
  [ModalVariants.CONTENT]: ContentModal,
};

type Props = Partial<ContentModalProps & QuestionModalProps> & {
  variant?: Values<typeof ModalVariants>;
};

const Modal = ({ variant = ModalVariants.CONTENT, ...props }: Props) => {
  const ModalVariant = Components[variant];
  if (!ModalVariant) return null;
  return <ModalVariant {...props} />;
};

export { Modal, ModalSizes, ModalVariants };
