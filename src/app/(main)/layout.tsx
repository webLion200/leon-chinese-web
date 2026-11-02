import React from 'react';
import { Layout } from 'antd';
import SiderMenu from '@/components/layout/sider-menu';
import { PageHeader } from '@/components/layout/header';
import { PageFooter } from '@/components/layout/footer';
import { PageContent } from '@/components/layout/content';

export default function Main({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 固定 Header */}
      <PageHeader />

      {/* 主体区域：Header 之后的内容 */}
      <Layout hasSider className="pt-16">
        <SiderMenu />

        <Layout className="bg-[#f5f5f5] flex flex-col">
          {/* 主体内容部分撑开高度 */}
          <PageContent>{children}</PageContent>

          {/* Footer 始终在内容底部，页面不够时吸底 */}
          <PageFooter />
        </Layout>
      </Layout>
    </Layout>
  );
}
