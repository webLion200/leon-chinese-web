'use client';
import { Layout } from 'antd';

const { Content } = Layout;
export function PageContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Content className="p-6">{children}</Content>;
}
