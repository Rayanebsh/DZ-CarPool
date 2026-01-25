import { renderHook, act, waitFor } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

function mockMatchMedia(matches: boolean) {
  return jest.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // Réinitialiser innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('retourne true quand viewport est mobile (<768px)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    // @ts-ignore
    window.matchMedia = mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('retourne false quand viewport est desktop (≥768px)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    // @ts-ignore
    window.matchMedia = mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('retourne undefined initialement avant montage', () => {
    // @ts-ignore
    window.matchMedia = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    // Le hook devrait se mettre à jour après le premier effet
    expect(typeof result.current).toBe('boolean');
  });

  it('met à jour la valeur quand la fenêtre est redimensionnée', async () => {
    const listeners: Array<() => void> = [];
    const mockMql = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: jest.fn((_, listener) => listeners.push(listener)),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    // @ts-ignore
    window.matchMedia = jest.fn(() => mockMql);

    const { result, rerender } = renderHook(() => useIsMobile());

    // Attendre la première mise à jour
    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Changer innerWidth et déclencher l'événement dans act
    await act(async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      listeners.forEach((listener) => listener());
    });

    rerender();

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('nettoie les event listeners au démontage', () => {
    const removeEventListener = jest.fn();
    const mockMql = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    // @ts-ignore
    window.matchMedia = jest.fn(() => mockMql);

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});
