import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useAddContactPointMutation } from '@/hooks/api/events';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

const ContactInfoType = {
  PHONE: 'phone',
  EMAIL: 'email',
  URL: 'url',
} as const;

type contactPoint = {
  phone: string[];
  email: string[];
  url: string[];
};

type Props = {
  eventId: string;
  eventContactInfo: contactPoint;
  invalidateEventQuery: (field: string) => void;
};

const getValue = getValueFromTheme('contactInformation');

const schema = yup
  .object()
  .shape({
    contactPoints: yup.array().of(
      yup.object({
        contactInfoType: yup.string(),
        contactInfo: yup.string(),
      }),
    ),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const ContactInfo = ({
  eventId,
  eventContactInfo,
  invalidateEventQuery,
}: Props) => {
  const { t } = useTranslation();
  const formComponent = useRef<HTMLFormElement>();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchedContactPoints = watch('contactPoints') ?? [];

  useEffect(() => {
    if (eventContactInfo) {
      const formData = [];
      // transform to event contact info to formData
      Object.keys(eventContactInfo).forEach((key, index) => {
        eventContactInfo[key].forEach((item) => {
          formData.push({
            contactInfoType: ContactInfoType[key.toUpperCase()],
            contactInfo: item,
          });
        });
      });
      setValue('contactPoints', formData);
    }
  }, [eventContactInfo, setValue]);

  const handleAddContactPoint = () => {
    setValue('contactPoints', [
      ...watchedContactPoints,
      {
        contactInfoType: ContactInfoType.PHONE,
        contactInfo: '',
      },
    ]);
  };

  const addContactPointMutation = useAddContactPointMutation({
    onSuccess: async () => {
      console.log('added contact point');
    },
  });

  const deleteContactPointMutation = useAddContactPointMutation({
    onSuccess: async () => {
      await invalidateEventQuery('contactPoint');
    },
  });

  const handleChangeInfoType = (event: any, id: number): void => {
    setValue('contactPoints', [
      ...watchedContactPoints.map((contactPoint, index) => {
        if (id === index) {
          contactPoint.contactInfoType = event.target.value;
        }
        return contactPoint;
      }),
    ]);
  };

  const prepareContactPointPayload = () => {
    // prepare payload
    const phone = watchedContactPoints
      .filter(
        (contactPoint) =>
          contactPoint.contactInfoType === ContactInfoType.PHONE,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    const email = watchedContactPoints
      .filter(
        (contactPoint) =>
          contactPoint.contactInfoType === ContactInfoType.EMAIL,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    const url = watchedContactPoints
      .filter(
        (contactPoint) => contactPoint.contactInfoType === ContactInfoType.URL,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    return {
      contactPoint: {
        phone,
        email,
        url,
      },
    };
  };

  const handleAddContactPointMutation = async () => {
    const contactPoint = prepareContactPointPayload();
    await addContactPointMutation.mutateAsync({
      eventId,
      contactPoint,
    });
  };

  const handleDeleteContactPoint = async (id: number) => {
    const newContactPoints = watchedContactPoints.filter(
      (_contactPoint, index) => id !== index,
    );

    const phone = newContactPoints
      .filter(
        (contactPoint) =>
          contactPoint.contactInfoType === ContactInfoType.PHONE,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    const email = newContactPoints
      .filter(
        (contactPoint) =>
          contactPoint.contactInfoType === ContactInfoType.EMAIL,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    const url = newContactPoints
      .filter(
        (contactPoint) => contactPoint.contactInfoType === ContactInfoType.URL,
      )
      .map((contactPoint) => contactPoint.contactInfo);

    const contactPoint = {
      contactPoint: {
        phone,
        email,
        url,
      },
    };

    await deleteContactPointMutation.mutateAsync({
      eventId,
      contactPoint,
    });
  };

  return (
    <Stack>
      <Inline spacing={3} marginBottom={3}>
        <Text fontWeight="bold">
          {t('create.additionalInformation.contact_info.title')}
        </Text>
        {watchedContactPoints.length === 0 && (
          <Button
            onClick={handleAddContactPoint}
            variant={ButtonVariants.SECONDARY}
          >
            {t('create.additionalInformation.contact_info.add')}
          </Button>
        )}
      </Inline>
      {watchedContactPoints.length > 0 && (
        <Stack
          as="form"
          ref={formComponent}
          spacing={3}
          css={`
            border: 1px solid ${getValue('borderColor')};
          `}
        >
          {watchedContactPoints.map((contactPoint, index) => (
            <Inline
              padding={3}
              key={index}
              css={
                index !== 0 &&
                `
              border-top: 1px solid ${getValue('borderColor')};
            `
              }
              spacing={5}
            >
              <FormElement
                id="contactInfoType"
                Component={
                  <Select
                    {...register(`contactPoints.${index}.contactInfoType`)}
                    onChange={(event) => handleChangeInfoType(event, index)}
                  >
                    {Object.keys(ContactInfoType).map((key, index) => (
                      <option key={index} value={ContactInfoType[key]}>
                        {t(
                          `create.additionalInformation.contact_info.${ContactInfoType[key]}`,
                        )}
                      </option>
                    ))}
                  </Select>
                }
              />
              <FormElement
                id="contactInfo"
                Component={
                  <Input
                    {...register(`contactPoints.${index}.contactInfo`)}
                    onBlur={handleAddContactPointMutation}
                  />
                }
              />
              <Button
                onClick={() => handleDeleteContactPoint(index)}
                variant={ButtonVariants.DANGER}
                iconName={Icons.TRASH}
              ></Button>
            </Inline>
          ))}
          <Inline
            padding={3}
            css={`
              border-top: 1px solid ${getValue('borderColor')};
            `}
          >
            <Button
              variant={ButtonVariants.LINK}
              onClick={handleAddContactPoint}
            >
              {t('create.additionalInformation.contact_info.add_more')}
            </Button>
          </Inline>
        </Stack>
      )}
    </Stack>
  );
};
export { ContactInfo };
