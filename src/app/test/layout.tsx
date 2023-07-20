import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'react-mqtt-manager test',
  description: 'react-mqtt-manager test',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
