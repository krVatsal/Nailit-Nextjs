import React from 'react';
import { render } from '@testing-library/react';
import SprintBoard from '../SprintBoard';

test('renders sprint board header', () => {
  const { getByText } = render(<SprintBoard />);
  const node = getByText(/Sprint Board Lite/i);
  if (!node) throw new Error('Sprint Board header not found');
});
