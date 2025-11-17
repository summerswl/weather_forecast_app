import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../src/components/Header';

// Behaviors covered:
// 1. Renders the heading text
// 2. Applies inline styles for layout and font size
// 3. Heading is wrapped inside a container div
// 4. Matches snapshot for structure and text
// 5. Has no unexpected additional text content

describe('Header Component', () => {
  it('renders the heading text', () => {
    render(<Header />);
    expect(
      screen.getByRole('heading', { name: 'Retrieve Forecast Data for a Given Address' })
    ).toBeInTheDocument();
  });

  it('applies inline styles for layout and font size', () => {
    const { container } = render(<Header />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({
      fontSize: '36px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
  });

  it('wraps heading inside a container div', () => {
    const { container } = render(<Header />);
    const wrapper = container.querySelector('div');
    const heading = screen.getByRole('heading', { name: /Retrieve Forecast/i });

    expect(wrapper).toContainElement(heading);
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Header />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('has only the expected heading text content', () => {
    render(<Header />);
    const allText = screen.getByText('Retrieve Forecast Data for a Given Address');
    expect(allText).toBeInTheDocument();
    // Ensure no duplicate headings with the same text
    expect(screen.getAllByRole('heading', { name: /Retrieve Forecast Data for a Given Address/ })).toHaveLength(1);
  });
});
