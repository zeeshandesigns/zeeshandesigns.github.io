import type { Preview } from '@storybook/react';
import '../src/styles/reset.css';
import '../src/design/tokens.css';
import '../src/design/utilities.css';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
