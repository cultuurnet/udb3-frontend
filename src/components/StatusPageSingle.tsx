import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/hooks/api/authenticated-quer... Remove this comment to see the full error message
import { useEffect, useState } from 'react';
import { QueryStatus } from '@/hooks/api/authenticated-query';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Alert' or its correspondi... Remove this comment to see the full error message
import { Alert, AlertVariants } from '@/ui/Alert';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Button' or its correspond... Remove this comment to see the full error message
import { Button, ButtonVariants } from '@/ui/Button';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Page' or its correspondin... Remove this comment to see the full error message
import { Inline } from '@/ui/Inline';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/ui/Spinner' or its correspon... Remove this comment to see the full error message
import { Page } from '@/ui/Page';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferId' or its c... Remove this comment to see the full error message
import { Spinner } from '@/ui/Spinner';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/parseOfferType' or its... Remove this comment to see the full error message
import { parseOfferId } from '@/utils/parseOfferId';
import { parseOfferType } from '@/utils/parseOfferType';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/components/ReasonAndTypeForm... Remove this comment to see the full error message
import { useTranslation } from 'react-i18next';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/constants/OfferStatus' or it... Remove this comment to see the full error message
import { ReasonAndTypeForm } from '@/components/ReasonAndTypeForm';

import { OfferStatus } from '@/constants/OfferStatus';

const StatusPageSingle = ({ offer, error, useChangeStatus }) => {
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

  const handleSuccessChangeStatus = () =>
    router.push(`/${offerType}/${offerId}/preview`);

  const changeStatusMutation = useChangeStatus({
    onSuccess: handleSuccessChangeStatus,
  });

  return (
    <Page>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Page.Title>{t('offerStatus.title', { name })}</Page.Title>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Page.Content spacing={5} maxWidth="36rem">
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        {changeStatusMutation.status === QueryStatus.LOADING ? (
          <Spinner marginTop={4} />
        ) : // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          error || changeStatusMutation.error ? (
          <Alert variant={AlertVariants.WARNING}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            {error.message || changeStatusMutation.error?.message}
          </Alert>
        ) : (
          [
            <ReasonAndTypeForm
              key="reason-and-type"
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              offerType={offerType}
              statusType={type}
              statusReason={reason}
              onChangeStatusType={(e) => setType(e.target.value)}
              // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
              onInputStatusReason={(e) => setReason(e.target.value)}
            />,
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
            <Inline key="actions" spacing={3}>
              <Button
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                variant={ButtonVariants.PRIMARY}
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
                // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                onClick={() => router.push(`/${offerType}/${offerId}/edit`)}
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

StatusPageSingle.propTypes = {
  offer: PropTypes.object.isRequired,
  error: PropTypes.object,
  useChangeStatus: PropTypes.func.isRequired,
};

export { StatusPageSingle };
