import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';

import { UUID_V4_REGEX } from '@/constants/Regex';
import {
  GetOrganizerByIdResponse,
  GetOrganizersByQueryResponse,
  useGetOrganizerByIdQuery,
  useGetOrganizersByQueryQuery,
} from '@/hooks/api/organizers';
import { getOrganizerName } from '@/pages/steps/AdditionalInformationStep/OrganizerPicker';
import { Organizer } from '@/types/Organizer';
import { FormElement } from '@/ui/FormElement';
import { getInlineProps, InlineProps } from '@/ui/Inline';
import { Typeahead, TypeaheadElement } from '@/ui/Typeahead';
import { valueToArray } from '@/utils/valueToArray';

type Props = {
  selected?: Organizer;
  onChange: (value: Organizer[]) => void;
} & Omit<InlineProps, 'onChange'>;

export const OrganizerPicker = ({
  selected,
  onChange,
  defaultInputValue,
  ...props
}: Props) => {
  const { i18n } = useTranslation();

  const [query, setQuery] = useState('');
  const isUuid = UUID_V4_REGEX.test(query);
  const getOrganizersByQueryQuery = useGetOrganizersByQueryQuery(
    {
      name: query,
    },
    { enabled: !isUuid },
  ) as UseQueryResult<GetOrganizersByQueryResponse>;

  const getOrganizerByIdQuery = useGetOrganizerByIdQuery(
    { id: query },
    { enabled: isUuid },
  ) as UseQueryResult<GetOrganizerByIdResponse>;

  const organizers = useMemo(() => {
    if (isUuid && getOrganizerByIdQuery.data) {
      return [getOrganizerByIdQuery.data];
    }

    if (getOrganizersByQueryQuery.data?.member) {
      return getOrganizersByQueryQuery.data.member;
    }

    return [];
  }, [
    getOrganizerByIdQuery.data,
    getOrganizersByQueryQuery.data?.member,
    isUuid,
  ]);

  return (
    <FormElement
      id={'ownership-organizer-picker'}
      label={'organizer'}
      Component={
        <Typeahead
          maxWidth="25rem"
          isLoading={
            getOrganizersByQueryQuery.isLoading ||
            getOrganizerByIdQuery.isLoading
          }
          options={organizers}
          selected={valueToArray(selected)}
          onChange={onChange}
          onInputChange={debounce((value) => {
            const trimmed = value.trim();

            setQuery(trimmed);

            if (trimmed === '') {
              onChange([undefined]);
            }
          }, 275)}
          labelKey={(org) => getOrganizerName(org as Organizer, i18n.language)}
          {...getInlineProps(props)}
        />
      }
    />
  );
};
