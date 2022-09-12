import React from 'react';
import { render } from '@testing-library/react';
import '../src/common/utils/polyfill';
import { OneAIAnalyticsApiWrapper } from '../src/wrappers/OneAIAnalyticsApiWrapper';

describe('Treemap', () => {
  it('renders without crashing', () => {
    const component = render(<OneAIAnalyticsApiWrapper />);
    component.unmount();
  });
});
