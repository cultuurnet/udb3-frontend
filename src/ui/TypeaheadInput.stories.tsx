import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

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

const suggestions = [
  'What are the opening hours?',
  'How do I get there?',
  'Is parking available?',
];

export const Default: Story = {
  render: function RenderComponent() {
    const [value, setValue] = useState('');

    return (
      <TypeaheadInput
        id="typeahead-input-default"
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
      <TypeaheadInput
        id="typeahead-input-selected"
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
        suggestions={suggestions}
      />
    );
  },
};

export const NoSuggestions: Story = {
  render: function RenderComponent() {
    const [value, setValue] = useState('');

    return (
      <TypeaheadInput
        id="typeahead-input-empty"
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
      />
    );
  },
};
