import { QuestionModal } from './Modal/QuestionModal';
import { ContentModal } from './Modal/ContentModal';
import type { Values } from '@/types/Values';

const ModalVariants = {
  QUESTION: 'question',
  CONTENT: 'content',
} as const;

const ModalSizes = {
  SM: 'sm',
  LG: 'lg',
  XL: 'xl',
} as const;

const Components = {
  [ModalVariants.QUESTION]: QuestionModal,
  [ModalVariants.CONTENT]: ContentModal,
} as const;

type ModalProps = {
  variant: Values<typeof ModalVariants>;
  size: Values<typeof ModalSizes>;
  className: string;
  visible: boolean;
  title: string;
  onShow: () => void;
  onClose: () => void;
  children: React.ReactNode;
  confirmTitle: string;
  cancelTitle: string;
  onConfirm: () => void;
  confirmButtonDisabled: boolean;
};

const Modal = ({ variant, ...props }: ModalProps) => {
  const ModalVariant = Components[variant];
  if (!ModalVariant) return null;
  return <ModalVariant {...props} />;
};

Modal.defaultProps = {
  variant: ModalVariants.CONTENT,
};

export { Modal, ModalVariants, ModalSizes };
export type { ModalProps };
