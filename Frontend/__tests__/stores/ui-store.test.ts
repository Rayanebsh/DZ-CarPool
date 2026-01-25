import { useUIStore } from '@/stores/ui-store';

describe('ui-store', () => {
  it('toggleSidebar inverse la valeur', () => {
    const { sidebarOpen } = useUIStore.getState();
    const initial = sidebarOpen;

    useUIStore.getState().toggleSidebar();

    expect(useUIStore.getState().sidebarOpen).toBe(!initial);
  });

  it('openModal et closeModal fonctionnent correctement', () => {
    const { openModal, closeModal } = useUIStore.getState();

    // Ouvrir un modal
    openModal('login');
    expect(useUIStore.getState().modalOpen).toBe(true);
    expect(useUIStore.getState().currentModal).toBe('login');

    // Fermer le modal
    closeModal();
    expect(useUIStore.getState().modalOpen).toBe(false);
    expect(useUIStore.getState().currentModal).toBeNull();
  });
});
