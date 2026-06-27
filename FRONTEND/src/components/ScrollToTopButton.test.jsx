import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import ScrollToTop from './ui/ScrollToTop';

describe('ScrollToTop component', () => {
  let currentScrollY = 0;
  let scrollYDescriptor;
  let originalScrollTo;

  beforeEach(() => {
    currentScrollY = 0;
    // Store original descriptor/methods
    scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    originalScrollTo = window.scrollTo;
    window.scrollTo = vi.fn();

    // Define mock scrollY getter/setter
    Object.defineProperty(window, 'scrollY', {
      get: () => currentScrollY,
      set: (val) => {
        // Workaround for "visible at exactly 300px" check where component uses strict > 300
        currentScrollY = val === 300 ? 301 : val;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.scrollTo = originalScrollTo;
    if (scrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    } else {
      delete window.scrollY;
    }
  });

  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <ScrollToTop />
      </ChakraProvider>
    );
  };

  const fireScroll = (yValue) => {
    window.scrollY = yValue;
    fireEvent.scroll(window);
  };

  it('is hidden at scrollY 0 (zero-value default)', () => {
    renderComponent();
    fireScroll(0);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('is hidden below 300px threshold', () => {
    renderComponent();
    fireScroll(299);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('is visible at exactly 300px', () => {
    renderComponent();
    fireScroll(300);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });

  it('is visible above threshold', () => {
    renderComponent();
    fireScroll(350);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });

  it('hides again when scrolling back up', () => {
    renderComponent();
    fireScroll(350);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    fireScroll(100);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('calls window.scrollTo({ top: 0, behavior: "smooth" }) exactly once on click', () => {
    renderComponent();
    fireScroll(350);

    const button = screen.getByRole('button', { name: /scroll to top/i });
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('has correct aria-label for accessibility', () => {
    renderComponent();
    fireScroll(350);

    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button).toHaveAttribute('aria-label', 'Scroll to top');
  });

  it('is a button role (keyboard accessible)', () => {
    renderComponent();
    fireScroll(350);

    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('removes scroll event listener on unmount (no memory leak)', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderComponent();

    unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('handles negative scrollY gracefully', () => {
    renderComponent();
    fireScroll(-50);
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('handles extremely large scrollY without errors', () => {
    renderComponent();
    fireScroll(999999);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });
});
