import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { TunnleConfig, ModalContext } from "./types";
import { TunnleModal } from "./Modal";
import { startDiscovery } from "./engine/discovery";

const defaultConfig: TunnleConfig = {
  appName: "App",
};

const Ctx = createContext<ModalContext>({
  open: () => {},
  close: () => {},
  isOpen: false,
  config: defaultConfig,
});

export const useWeb3Tunnle = () => useContext(Ctx);

export function Web3TunnleProvider({
  children,
  config = defaultConfig,
}: {
  children: ReactNode;
  config?: Partial<TunnleConfig>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const cleanup = startDiscovery();
    return cleanup;
  }, []);

  const mergedConfig = { ...defaultConfig, ...config };

  return (
    <Ctx.Provider value={{ open, close, isOpen, config: mergedConfig }}>
      {children}
      <TunnleModal isOpen={isOpen} onClose={close} />
    </Ctx.Provider>
  );
}
