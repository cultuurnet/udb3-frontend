import PropTypes from 'prop-types';

import { ContentModal } from './Modal/ContentModal';
import { QuestionModal } from './Modal/QuestionModal';
import { Values } from '@/types/Values';
import { ReactNode } from 'react';

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
} as const;

type Props = {
  variant?: Values<typeof ModalVariants>;
  size: Values<typeof ModalSizes>;
  className: string;
  visible: boolean;
  title: string;
  onShow: () => void;
  scrollable: boolean;
  onClose: () => void;
  children: ReactNode;
  confirmTitle: string;
  cancelTitle: string;
  onConfirm: () => void;
  confirmButtonDisabled: boolean;
};

const Modal = ({ variant = ModalVariants.CONTENT, ...props }: Props) => {
  const ModalVariant = Components[variant];
  if (!ModalVariant) return null;
  // @ts-expect-error TS2322 TODO: Fix type error
  return <ModalVariant {...props} />;
};

export { Modal, ModalSizes, ModalVariants };
