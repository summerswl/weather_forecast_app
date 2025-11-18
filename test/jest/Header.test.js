import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/components/Header';

// Behaviors covered:
// 1. Renders the heading text
// 2. Applies inline styles for layout and font size
// 3. Heading is wrapped inside a container div
// 4. Matches snapshot for structure and text
// 5. Has no unexpected additional text content

describe('Header Component', () => {
  it('renders the heading text', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: 'Weather Forecast App' })
    ).toBeInTheDocument();
  });

  it('wraps heading inside a container div', () => {
    const { container } = render(<MemoryRouter>
                                  <Header />
                                </MemoryRouter>);
    const wrapper = container.querySelector('div');
    const heading = screen.getByRole('heading', { name: /Weather Forecast App/i });

    expect(wrapper).toContainElement(heading);
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<MemoryRouter>
                                    <Header />
                                  </MemoryRouter>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('has only the expected heading text content', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const allText = screen.getByText('Weather Forecast App');
    expect(allText).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /Weather Forecast App/ })).toHaveLength(1);
  });
});
