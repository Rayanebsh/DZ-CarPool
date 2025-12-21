'use client';

import { create } from 'zustand';
import authService from '@/services/auth.service';

interface PreferencesState {
  selectedPreferences: number[];
  allPreferences: any[];
  loading: boolean;
  togglePreference: (id: number) => void;
  setPreferences: (ids: number[]) => void;
  setAllPreferences: (prefs: any[]) => void;
  savePreferences: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  selectedPreferences: [],
  allPreferences: [],
  loading: false,

  togglePreference: (id) =>
    set((state) => ({
      selectedPreferences: state.selectedPreferences.includes(id)
        ? state.selectedPreferences.filter((p) => p !== id)
        : [...state.selectedPreferences, id],
    })),

  setPreferences: (ids) => set({ selectedPreferences: ids }),
  setAllPreferences: (prefs) => set({ allPreferences: prefs }),

  savePreferences: async () => {
    try {
      set({ loading: true });
      const { selectedPreferences } = get();
      await authService.updatePreferences(selectedPreferences);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
