import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Icon, Icons } from './Icon';
import { SuggestionInput } from './SuggestionInput';

const meta: Meta<typeof SuggestionInput> = {
  title: 'Components/SuggestionInput',
  component: SuggestionInput,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const suggestions = [
  'What are the opening hours?',
  'How do I get there?',
  'Is parking available?',
];

export const Default: Story = {
  render: function RenderComponent() {
    const [value, setValue] = useState('');

    return (
      <SuggestionInput
        id="suggestion-input-default"
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
        suggestions={suggestions}
      />
    );
  },
};

export const WithSelectedValue: Story = {
  render: function RenderComponent() {
    const [value, setValue] = useState(suggestions[0]);

    return (
      <SuggestionInput
        id="suggestion-input-selected"
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
        suggestions={suggestions}
      />
    );
  },
};

export const WithCustomIcon: Story = {
  render: function RenderComponent() {
    const [value, setValue] = useState('');

    return (
      <SuggestionInput
        id="suggestion-input-custom-icon"
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
        suggestions={suggestions}
        icon={<Icon name={Icons.CHEVRON_DOWN} />}
      />
    );
  },
};
