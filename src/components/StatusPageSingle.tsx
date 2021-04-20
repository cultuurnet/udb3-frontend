import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Page } from '@/ui/Page';
import { Spinner } from '@/ui/Spinner';
import { parseOfferId } from '@/utils/parseOfferId';
import { parseOfferType } from '@/utils/parseOfferType';
import { useTranslation } from 'react-i18next';
import { ReasonAndTypeForm } from '@/components/ReasonAndTypeForm';
import { OfferStatus } from '@/constants/OfferStatus';
import { Offer } from '@/types/Offer';

type Props = {
  offer: Offer;
  error?: Error;
  useChangeStatus: () => void;
};

const StatusPageSingle = ({ offer, error, useChangeStatus }: Props) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const offerId = parseOfferId(offer['@id']);
  const offerType = parseOfferType(offer['@context']);
  const name =
    offer?.name?.[i18n.language] ?? offer?.name?.[offer.mainLanguage];
  const rawStatusType = offer?.status?.type;
  const rawStatusReason = offer?.status?.reason;

  const [type, setType] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!rawStatusType) return;
    setType(rawStatusType);
  }, [rawStatusType]);

  useEffect(() => {
    if (type === OfferStatus.AVAILABLE) {
      setReason('');
    }
  }, [type]);

  useEffect(() => {
    const newReason = offer?.status?.reason?.[i18n.language];
    if (!rawStatusReason || !newReason) return;
    setReason(newReason);
  }, [rawStatusReason]);

  const handleSuccessChangeStatus = async () =>
    await router.push(`/${offerType}/${offerId}/preview`);

  const changeStatusMutation = useChangeStatus({
    onSuccess: handleSuccessChangeStatus,
  });

  return (
    <Page>
      <Page.Title>{t('offerStatus.title', { name })}</Page.Title>
      <Page.Content spacing={5} maxWidth="36rem">
        {changeStatusMutation.status === QueryStatus.LOADING ? (
          <Spinner marginTop={4} />
        ) : error || changeStatusMutation.error ? (
          <Alert variant={AlertVariants.WARNING}>
            {error.message || changeStatusMutation.error?.message}
          </Alert>
        ) : (
          [
            <ReasonAndTypeForm
              key="reason-and-type"
              offerType={offerType}
              statusType={type}
              statusReason={reason}
              onChangeStatusType={(e) => setType(e.target.value)}
              onInputStatusReason={(e) => setReason(e.target.value)}
            />,
            <Inline key="actions" spacing={3}>
              <Button
                variant={ButtonVariants.PRIMARY}
                disabled={!offer || reason.length > 200}
                onClick={() => {
                  if (type === OfferStatus.AVAILABLE) {
                    changeStatusMutation.mutate({
                      id: offerId,
                      type,
                    });
                  } else {
                    changeStatusMutation.mutate({
                      id: offerId,
                      type,
                      reason: {
                        ...(offer.status.type === type && offer.status.reason),
                        ...(reason.length > 0 && { [i18n.language]: reason }),
                      },
                    });
                  }
                }}
              >
                {t('offerStatus.actions.save')}
              </Button>
              <Button
                variant={ButtonVariants.SECONDARY}
                onClick={async () =>
                  await router.push(`/${offerType}/${offerId}/edit`)
                }
              >
                {t('offerStatus.actions.cancel')}
              </Button>
            </Inline>,
          ]
        )}
      </Page.Content>
    </Page>
  );
};

export { StatusPageSingle };
