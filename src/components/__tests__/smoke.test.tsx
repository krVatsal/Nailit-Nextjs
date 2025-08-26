import React from 'react';
import { render } from '@testing-library/react';
import SprintBoard from '../SprintBoard';

test('renders sprint board header', () => {
  const { getByText } = render(<SprintBoard />);
  expect(getByText(/Sprint Board Lite/i)).toBeTruthy();
});
