import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import { useAddContactPointMutation } from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { hasCultuurkuurOrganizerLabel } from '@/utils/hasCultuurkuurOrganizerLabel';
import { isValidInfo } from '@/utils/isValidInfo';

import { TabContentProps, ValidationStatus } from './AdditionalInformationStep';

const ContactInfoTypes = {
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',
} as const;

type ContactInfo = {
  email: string[];
  phone: string[];
  url: string[];
};

type NewContactInfo = {
  type: string;
  value: string;
};

type Props = StackProps &
  TabContentProps & {
    organizerContactInfo: ContactInfo;
  };

const ContactInfoStep = ({
  scope,
  offerId,
  field,
  onSuccessfulChange,
  onValidationChange,
  organizerContactInfo,
  ...props
}: Props) => {
  const { t } = useTranslation();

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });

  const [contactInfoState, setContactInfoState] = useState<NewContactInfo[]>(
    [],
  );

  const [isFieldFocused, setIsFieldFocused] = useState(false);

  const [isCultuurkuurAlertVisible, setIsCultuurkuurAlertVisible] =
    useState(false);

  const isCultuurkuurOrganizer = hasCultuurkuurOrganizerLabel(
    getEntityByIdQuery.data?.hiddenLabels,
  );
  const rawContactInfo =
    getEntityByIdQuery.data?.contactPoint ?? organizerContactInfo;

  const hasAnyContactInfo = ['email', 'phone', 'url'].some(
    (key) =>
      rawContactInfo?.[key]?.length > 0 && rawContactInfo?.[key]?.value !== '',
  );

  const hasEmail = rawContactInfo?.email?.some((email) => email !== '');

  useEffect(() => {
    if (!rawContactInfo) return;

    const contactInfoArray: NewContactInfo[] = [];

    Object.entries(rawContactInfo).forEach(([type, values]) => {
      (values as string[]).forEach((value) => {
        contactInfoArray.push({ type, value });
      });
    });

    setContactInfoState(contactInfoArray);
  }, [rawContactInfo]);

  useEffect(() => {
    if (!onValidationChange) {
      return;
    }

    if (!hasEmail && isCultuurkuurOrganizer) {
      onValidationChange(ValidationStatus.WARNING, field);
      setIsCultuurkuurAlertVisible(true);
      return;
    }

    if (!hasAnyContactInfo) {
      onValidationChange(ValidationStatus.NONE, field);
      return;
    }

    onValidationChange(ValidationStatus.SUCCESS, field);
    setIsCultuurkuurAlertVisible(false);
  }, [
    field,
    contactInfoState,
    isCultuurkuurOrganizer,
    hasEmail,
    hasAnyContactInfo,
    onValidationChange,
  ]);

  const queryClient = useQueryClient();

  const addContactPointMutation = useAddContactPointMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [scope, { id: offerId }],
      });

      const previousEventInfo: any = queryClient.getQueryData([
        scope,
        { id: offerId },
      ]);

      return { previousEventInfo };
    },
    onError: (_err, _newBookingInfo, context) => {
      queryClient.setQueryData(
        [scope, { id: offerId }],
        context.previousEventInfo,
      );
    },
  });

  const parseNewContactInfo = (newContactInfo: NewContactInfo[]) => {
    const [email, phone, url] = Object.values(ContactInfoTypes).map(
      (infoType) =>
        newContactInfo
          .filter(
            (info) =>
              info.type === infoType &&
              info.value !== '' &&
              isValidInfo(infoType, info.value),
          )
          .map((info) => info.value),
    );

    return { email, phone, url };
  };

  const handleAddContactInfoMutation = async (
    newContactInfo: NewContactInfo[],
  ) => {
    const contactPoint = parseNewContactInfo(newContactInfo);
    if (!offerId) {
      return onSuccessfulChange(contactPoint);
    }

    await addContactPointMutation.mutateAsync(
      {
        eventId: offerId,
        contactPoint,
        scope,
      },
      {
        onSuccess: async () => {
          onSuccessfulChange(contactPoint);
          await queryClient.invalidateQueries([scope, { id: offerId }]);
        },
      },
    );
  };

  const handleChangeValue = async (
    event: FormEvent<HTMLInputElement>,
    index: number,
  ) => {
    let newValue = (event.target as HTMLInputElement).value;
    const infoType = contactInfoState[index].type;

    if (!isValidInfo(infoType, newValue)) return;

    const newContactInfo = [...contactInfoState];
    newContactInfo[index].value = newValue;

    if (newValue === '') return;

    await handleAddContactInfoMutation(newContactInfo);
  };

  const handleAddNewContactInfo = () => {
    const newContactInfo = [...contactInfoState];
    newContactInfo.push({ type: ContactInfoTypes.EMAIL, value: '' });
    setContactInfoState(newContactInfo);
  };

  const handleDeleteContactInfo = async (index: number) => {
    const newContactInfo = [...contactInfoState];
    newContactInfo.splice(index, 1);

    setContactInfoState(newContactInfo);

    await handleAddContactInfoMutation(newContactInfo);
  };

  const handleChangeContactInfoType = async (
    event: ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const newType = event.target.value;
    const newContactInfo = [...contactInfoState];
    newContactInfo[index].type = newType;
    newContactInfo[index].value = '';

    setContactInfoState(newContactInfo);
  };

  return (
    <Stack maxWidth="40rem" {...getStackProps(props)} spacing={4}>
      {(contactInfoState ?? []).map((info, index) => {
        return (
          <Inline key={index} spacing={3}>
            <Select
              alignSelf="flex-start"
              height="2.38rem"
              width="30%"
              onChange={(e) => handleChangeContactInfoType(e, index)}
            >
              {Object.values(ContactInfoTypes).map((type) => (
                <option value={type} selected={info.type === type} key={type}>
                  {t(`create.additionalInformation.contact_info.${type}`)}
                </option>
              ))}
            </Select>
            <FormElement
              id={`contact-info-value-${index}`}
              alignSelf="flex-start"
              width="55%"
              Component={
                <Input
                  data-testid="contact-info-value"
                  value={info.value}
                  onChange={(e) => {
                    const newContactInfoState = [...contactInfoState];
                    newContactInfoState[index].value = e.target.value.trim();
                    setContactInfoState(newContactInfoState);
                    setIsFieldFocused(true);
                  }}
                  onBlur={(e) => {
                    setIsFieldFocused(false);
                    handleChangeValue(e, index);
                  }}
                />
              }
              error={
                !isFieldFocused &&
                !isValidInfo(info.type, info.value) &&
                t(
                  `create.additionalInformation.contact_info.${info.type}_error`,
                )
              }
            />
            <Button
              alignSelf="flex-start"
              onClick={() => handleDeleteContactInfo(index)}
              variant={ButtonVariants.DANGER}
              iconName={Icons.TRASH}
            />
          </Inline>
        );
      })}
      <Inline>
        <Button
          onClick={handleAddNewContactInfo}
          variant={ButtonVariants.SECONDARY}
        >
          {contactInfoState.length === 0
            ? t('create.additionalInformation.contact_info.add_more_singular')
            : t('create.additionalInformation.contact_info.add_more_multiple')}
        </Button>
      </Inline>
      {isCultuurkuurAlertVisible && (
        <Alert variant={AlertVariants.WARNING} marginBottom={3}>
          {t('create.additionalInformation.contact_info.cultuurkuur.warning')}
        </Alert>
      )}
    </Stack>
  );
};

export { ContactInfoStep };
export type { ContactInfo };
