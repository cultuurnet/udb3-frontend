import { Page } from '@/ui/Page';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { Stack } from '@/ui/Stack';
import { Inline } from '@/ui/Inline';
import { Button, ButtonVariants } from '@/ui/Button';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Input } from '@/ui/Input';
import { FormElement } from '@/ui/FormElement';

const Ownership = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { register, formState, getValues } = useForm();
  const organizer = { name: 'foobar' };

  const handleConfirm = () => {
    const email = getValues('email');
    console.log({ email });
  };

  return (
    <Page>
      <Page.Title>
        {t('organizers.ownerships.title', { name: organizer.name })}
      </Page.Title>
      <Page.Content>
        <Inline
          display={'grid'}
          css={`
            grid-template-columns: 3fr 1fr;
            gap: 1rem;
          `}
        >
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore eos
            nisi maiores. Doloribus molestias magnam facilis! Eum rerum ea fugit
            excepturi doloribus, assumenda quod vitae magni tempore voluptatum
            adipisci aliquam.
          </div>
          <Stack spacing={3}>
            <Button onClick={() => setIsOpen(true)}>
              {t('organizers.ownerships.actions.add')}
            </Button>
            <Button variant={ButtonVariants.SECONDARY}>
              {t('organizers.ownerships.actions.back')}
            </Button>
          </Stack>
        </Inline>
        <Modal
          visible={isOpen}
          variant={ModalVariants.QUESTION}
          size={ModalSizes.MD}
          title={t('organizers.ownerships.modal.title', {
            name: organizer.name,
          })}
          confirmTitle={t('organizers.ownerships.modal.actions.confirm')}
          cancelTitle={t('organizers.ownerships.modal.actions.cancel')}
          onConfirm={handleConfirm}
          onClose={() => setIsOpen(false)}
        >
          <Stack padding={4}>
            <FormElement
              id={'email'}
              Component={<Input type={'email'} {...register('email')} />}
              label={t('organizers.ownerships.modal.email')}
              error={formState.errors.email && 'email is required'}
            />
          </Stack>
        </Modal>
      </Page.Content>
    </Page>
  );
};

export const getServerSideProps = getApplicationServerSideProps();

export default Ownership;
