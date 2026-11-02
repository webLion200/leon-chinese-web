// src/components/search-bar.tsx
'use client';

import React from 'react';
import { Form, Row, Col, Button, Space, FormInstance } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

export interface ISearchItem {
  name: string;
  label: string;
  element: React.ReactNode;
}

interface SearchBarProps {
  form: FormInstance;
  items: ISearchItem[];
  onSearch: (values: any) => void;
  onReset?: () => void;
  isLoading?: boolean;
  /** 每个表单项占用的栅格数，默认 6 (即 1/4) */
  colSpan?: number;
  /** 每行显示的表单项数量，默认 4 */
  maxCol?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  form,
  items,
  onSearch,
  onReset,
  isLoading,
  colSpan = 6, // 默认 6
  maxCol = 4, // 默认 4
}) => {
  const itemCount = items.length;

  // 渲染操作按钮组
  const renderActionButtons = () => (
    <Space size="small">
      <Button type="primary" loading={isLoading} icon={<SearchOutlined />} htmlType="submit">
        搜索
      </Button>
      <Button
        icon={<ReloadOutlined />}
        onClick={() => {
          form.resetFields();
          onReset?.();
        }}
      >
        重置
      </Button>
    </Space>
  );

  return (
    <Form form={form} onFinish={onSearch} layout="horizontal">
      <Row gutter={[24, 0]}>
        {/* 渲染搜索项 */}
        {items.map((item) => (
          <Col span={colSpan} key={item.name}>
            <Form.Item name={item.name} label={item.label}>
              {item.element}
            </Form.Item>
          </Col>
        ))}

        {/* 按钮布局逻辑 */}
        {itemCount < maxCol ? (
          /** * 情况 1：不满第一排
           * 计算剩余宽度并让按钮居右对齐
           */
          <Col span={24 - itemCount * colSpan} className="text-right">
            <Form.Item>{renderActionButtons()}</Form.Item>
          </Col>
        ) : (
          /** * 情况 2：超过一排或刚好一排
           * 按钮强制换行（span=24）并居右
           */
          <Col span={24} className="text-right">
            <Form.Item className="mb-0">{renderActionButtons()}</Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default SearchBar;
