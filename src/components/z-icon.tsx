'use client';
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export default function ZIcon({ name, size = 16, className = '', onClick = () => {} }: IconProps) {
  return <i className={`iconfont icon-${name} ${className}`} style={{ fontSize: `${size}px` }} onClick={onClick} />;
}
