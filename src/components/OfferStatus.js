import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertVariants } from './publiq-ui/Alert';
import { Button, ButtonVariants } from './publiq-ui/Button';
import { Page } from './publiq-ui/Page';
import { Spinner } from './publiq-ui/Spinner';
import { SelectionTable } from './publiq-ui/SelectionTable';

const OfferStatus = ({ offer, loading, errorMessage }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Tijdstip',
        accessor: 'time',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
    ],
    [],
  );
  const data = useMemo(
    () => [
      {
        time: new Date().toDateString(),
        status: 'Geannuleerd',
      },
      {
        time: new Date().toDateString(),
        status: 'Gaat door',
      },
    ],
    [],
  );
  const { t, i18n } = useTranslation();
  const [, setSelectedOffers] = useState([]);
  const name = offer.name?.[i18n.language] ?? offer.name?.[offer.mainLanguage];

  return (
    <Page>
      <Page.Title>{t('offerStatus.title', { name })}</Page.Title>
      <Page.Content spacing={5}>
        {loading ? (
          <Spinner marginTop={4} />
        ) : errorMessage ? (
          <Alert variant={AlertVariants.WARNING}>{errorMessage}</Alert>
        ) : (
          [
            <Alert key="alert">{t('offerStatus.info')}</Alert>,
            <SelectionTable
              key="table"
              columns={columns}
              data={data}
              onSelectionChanged={setSelectedOffers}
            />,
            <Button
              key="button"
              variant={ButtonVariants.SUCCESS}
              width="max-content"
            >
              {t('offerStatus.modificationReady')}
            </Button>,
          ]
        )}
      </Page.Content>
    </Page>
  );
};

OfferStatus.propTypes = {
  offer: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export { OfferStatus };
