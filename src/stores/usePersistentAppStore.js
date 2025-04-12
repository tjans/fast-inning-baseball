import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const usePersistentAppStore = create(
  persist(
    (set, get) => ({

      // state variables
      title: "Fast Inning Baseball",

      // derived functions
      someFunction: () => {

      },

      // actions
      setTitle: (title) => set(({ title: title })),
    }),
    {
      name: 'FIB',
      storage: createJSONStorage(() => localStorage)
    },
  ),
);

export const useTitle = () => useAppStore(state => state.title);
export default useAppStore;