"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

const AdminFabContext = createContext(null);

export function AdminFabProvider({ children }) {
  const [fabAction, setFabAction] = useState(null);

  const setFabActionStable = useCallback((fn) => {
    setFabAction(fn);
  }, []);

  const value = useMemo(() => ({ setFabAction: setFabActionStable }), [setFabActionStable]);

  return (
    <AdminFabContext.Provider value={value}>
      {children}
      {fabAction && (
        <button
          type="button"
          onClick={() => fabAction()}
          className="absolute right-6 top-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-2xl font-light leading-none text-black shadow-lg transition hover:bg-amber-500"
          aria-label="Add or open form"
        >
          +
        </button>
      )}
    </AdminFabContext.Provider>
  );
}

export function useAdminFab() {
  const ctx = useContext(AdminFabContext);
  if (!ctx) throw new Error("useAdminFab must be used within AdminFabProvider");
  return ctx;
}

/** Registers the FAB for this page; clears on unmount */
export function useRegisterFab(openModal) {
  const { setFabAction } = useAdminFab();
  useEffect(() => {
    setFabAction(openModal);
    return () => setFabAction(null);
  }, [setFabAction, openModal]);
}
