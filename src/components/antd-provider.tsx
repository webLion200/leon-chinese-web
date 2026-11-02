'use client';

import { ConfigProvider, App as AntdApp, theme } from 'antd';
import cn from 'antd/locale/zh_CN';
import AntdMessageProvider from '@/components/ant-message-provider';
import { primaryColor } from '@/utils/colors';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={cn}
      theme={{
        token: {
          colorPrimary: primaryColor, // 设置colorPrimary，会自动生成一套配色方案
        },
      }}
    >
      <AntdApp>
        <AntdMessageProvider>{children}</AntdMessageProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
