import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAppStore = create(
  (set) => ({
    title: 'Default Title',
    auth: null,
    setTitle: (newTitle) => set({ title: newTitle }),
    setAuth: (auth) => set({ auth }),
  })
);

export const useTitle = () => useAppStore(state => state.title);

export default useAppStore;