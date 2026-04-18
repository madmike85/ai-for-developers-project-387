import { AppShell as MantineAppShell } from '@mantine/core';
import { Header } from './Header';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <MantineAppShell
      header={{ height: 70 }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Header />
      </MantineAppShell.Header>

      <MantineAppShell.Main style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
};
