'use client';

import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import React, { useState } from 'react';
import './index.css';

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: 'calc(100vh - 64px)', // 减去 Header 的高度
  position: 'sticky',
  top: 64, // 对齐 Header 的高度
  left: 0,
  paddingTop: '12px',
};

const menuItems: MenuProps['items'] = [
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
  CloudOutlined,
  AppstoreOutlined,
  TeamOutlined,
].map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: `菜单选项 ${index + 1}`,
}));

const { Sider } = Layout;

export default function SiderMenu() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      theme="light"
      width={160}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={siderStyle}
      className="sider-container"
    >
      <Menu
        defaultSelectedKeys={['1']}
        items={menuItems}
        style={{ paddingBottom: '50px' }}
        className="!hover:bg-z-primary hover:text-white"
      />
    </Sider>
  );
}
