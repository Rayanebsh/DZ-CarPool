// __tests__/app/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/language-context';
import Home from '@/app/page';

// Mock des composants enfants
jest.mock('@/components/header', () => ({
  Header: ({ onNotificationsClick }: any) => (
    <header data-testid="header">
      <button onClick={onNotificationsClick} data-testid="notifications-btn">
        Notifications
      </button>
    </header>
  ),
}));

jest.mock('@/components/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero</div>,
}));

jest.mock('@/components/why-dz-carpool', () => ({
  WhyDZCarPool: () => <div data-testid="why-dz-carpool">Why DZ-CarPool</div>,
}));

jest.mock('@/components/how-it-works', () => ({
  HowItWorks: () => <div data-testid="how-it-works">How It Works</div>,
}));

jest.mock('@/components/cta-section', () => ({
  CTASection: () => <div data-testid="cta-section">CTA</div>,
}));

jest.mock('@/components/faq-section', () => ({
  FAQSection: () => <div data-testid="faq-section">FAQ</div>,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('@/components/notifications-sidebar', () => ({
  NotificationsSidebar: ({ open, onClose }: any) => (
    <div data-testid="notifications-sidebar" data-open={open}>
      <button onClick={onClose} data-testid="close-notifications">
        Close
      </button>
    </div>
  ),
}));

const renderHome = () => {
  return render(
    <LanguageProvider>
      <Home />
    </LanguageProvider>,
  );
};

describe('Home Page', () => {
  it('renders all main sections', () => {
    renderHome();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-dz-carpool')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders sections with correct IDs for navigation', () => {
    renderHome();

    expect(document.querySelector('#hero')).toBeInTheDocument();
    expect(document.querySelector('#why-us')).toBeInTheDocument();
    expect(document.querySelector('#how-it-works')).toBeInTheDocument();
    expect(document.querySelector('#cta')).toBeInTheDocument();
    expect(document.querySelector('#faq')).toBeInTheDocument();
  });

  it('notifications sidebar is closed by default', () => {
    renderHome();

    const sidebar = screen.getByTestId('notifications-sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('opens notifications sidebar when header button is clicked', () => {
    renderHome();

    const notificationsBtn = screen.getByTestId('notifications-btn');
    fireEvent.click(notificationsBtn);

    const sidebar = screen.getByTestId('notifications-sidebar');
    expect(sidebar).toHaveAttribute('data-open', 'true');
  });

  it('closes notifications sidebar when close button is clicked', () => {
    renderHome();

    // Ouvrir
    fireEvent.click(screen.getByTestId('notifications-btn'));
    expect(screen.getByTestId('notifications-sidebar')).toHaveAttribute(
      'data-open',
      'true',
    );

    // Fermer
    fireEvent.click(screen.getByTestId('close-notifications'));
    expect(screen.getByTestId('notifications-sidebar')).toHaveAttribute(
      'data-open',
      'false',
    );
  });

  it('has correct layout structure', () => {
    const { container } = renderHome();

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement?.children.length).toBe(5); // 5 sections
  });
});
