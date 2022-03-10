import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGetThemesByCategoryId } from '@/hooks/api/themes';
import type { FormDataUnion, StepProps } from '@/pages/Steps';
import { Button, ButtonVariants } from '@/ui/Button';
import { Icon, Icons } from '@/ui/Icon';
import { Inline } from '@/ui/Inline';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

const getValue = getValueFromTheme('moviesCreatePage');

const CategoryAndThemeStep = <TFormData extends FormDataUnion>({
  control,
  reset,
  field,
  getValues,
  onChange,
}: StepProps<TFormData>) => {
  const categoryId = 'test';

  const { t, i18n } = useTranslation();

  const useGetThemesByCategoryIdQuery = useGetThemesByCategoryId({
    categoryId,
  });

  // @ts-expect-error
  const themes = useMemo(() => useGetThemesByCategoryIdQuery.data ?? {}, [
    // @ts-expect-error
    useGetThemesByCategoryIdQuery.data,
  ]);

  return (
    <Controller
      name={field}
      control={control}
      render={({ field }) => {
        if (!field.value) {
          return (
            <Inline spacing={3} flexWrap="wrap" maxWidth="70rem">
              {Object.entries(themes).map(([themeId, themeData]) => (
                <Button
                  width="auto"
                  marginBottom={3}
                  display="inline-flex"
                  key={themeId}
                  variant={ButtonVariants.SECONDARY}
                  onClick={() => {
                    field.onChange({ ...field.value, theme: { id: themeId } });
                    onChange(themeId);
                  }}
                >
                  {themeData[`label_${i18n.language}`]}
                </Button>
              ))}
            </Inline>
          );
        }

        return (
          <Inline alignItems="center" spacing={3}>
            <Icon
              name={Icons.CHECK_CIRCLE}
              color={getValue('check.circleFillColor')}
            />
            <Text>{themes?.[field.value]?.[`label_${i18n.language}`]}</Text>
            <Button
              variant={ButtonVariants.LINK}
              onClick={() =>
                reset(
                  { ...getValues(), categoryAndTheme: undefined },
                  { keepDirty: true },
                )
              }
            >
              {t('movies.create.actions.change_theme')}
            </Button>
          </Inline>
        );
      }}
    />
  );
};

export { CategoryAndThemeStep };
