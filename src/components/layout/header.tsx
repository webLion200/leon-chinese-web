import { Header } from 'antd/es/layout/layout';
import Icon from '@/components/z-icon';
import { Image } from 'antd';

export function PageHeader() {
  return (
    <Header className="fixed flex items-center justify-between top-0 z-100 w-full !text-white !bg-z-primary h-16">
      <div className="flex items-center gap-2">
        <Image
          src="/imgs/logo.png"
          width={32}
          preview={false}
          className="cursor-pointer transition-transform duration-1000 hover:[transform:rotate(360deg)]"
        />
        <span className="text-lg font-bold">紫金砺锋</span>
      </div>
      <div className="flex items-center gap-6">
        <Icon name="notice" className="cursor-pointer" />
        <div className="flex items-center gap-2 cursor-pointer text-xs">
          <Icon name="user" size={24} />
          Admin
        </div>
      </div>
    </Header>
  );
}
