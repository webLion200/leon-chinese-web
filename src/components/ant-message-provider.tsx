'use client';
import { useEffect } from 'react';
import { message } from 'antd';
import { setMessageApi } from '@/lib/message-service';

export default function AntdMessageProvider({ children }: { children: React.ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setMessageApi(messageApi);
    return () => {
      // clear reference on unmount
      setMessageApi(null);
    };
  }, [messageApi]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}
