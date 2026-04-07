import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TypeaheadInput } from './TypeaheadInput';

const meta: Meta<typeof TypeaheadInput> = {
  title: 'Components/TypeaheadInput',
  component: TypeaheadInput,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function RenderComponent() {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const suggestions = t(
      'create.additionalInformation.faq.modal.suggestions',
      { returnObjects: true },
    ) as string[];

    return (
      <TypeaheadInput
        id="typeahead-input-default"
        value={value}
        onChange={setValue}
        placeholder={t(
          'create.additionalInformation.faq.modal.question_placeholder',
        )}
        suggestions={suggestions}
      />
    );
  },
};

export const WithSelectedValue: Story = {
  render: function RenderComponent() {
    const { t } = useTranslation();
    const suggestions = t(
      'create.additionalInformation.faq.modal.suggestions',
      { returnObjects: true },
    ) as string[];
    const [value, setValue] = useState(suggestions[0]);

    return (
      <TypeaheadInput
        id="typeahead-input-selected"
        value={value}
        onChange={setValue}
        placeholder={t(
          'create.additionalInformation.faq.modal.question_placeholder',
        )}
        suggestions={suggestions}
      />
    );
  },
};

export const NoSuggestions: Story = {
  render: function RenderComponent() {
    const { t } = useTranslation();
    const [value, setValue] = useState('');

    return (
      <TypeaheadInput
        id="typeahead-input-empty"
        value={value}
        onChange={setValue}
        placeholder={t(
          'create.additionalInformation.faq.modal.question_placeholder',
        )}
      />
    );
  },
};
