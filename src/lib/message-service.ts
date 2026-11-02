let _messageApi: any = null;

export const setMessageApi = (api: any) => {
    _messageApi = api;
};

const callAntdMessage = async (method: string, args: unknown[]): Promise<any> => {
    // 首选注入 messageApi（来自 message.useMessage()）
    if (_messageApi && typeof _messageApi[method] === 'function') {
        return (_messageApi as any)[method](...args);
    }

    // 回退：动态导入 antd 的 message（全局静态）
    const mod = await import('antd');
    const m = (mod as any).message;
    const fn = m[method];
    if (typeof fn === 'function') return fn.apply(m, args as any);
    // 如果是属性，就返回它
    return (m as any)[method];
};

export type MessageProxy = {
    setMessageApi: (api: any) => void; // 处理useMessage返回的messageApi，见AntdMessageProvider.tsx
} & Record<string, any>;

export const createProxy = (): MessageProxy => {
    return new Proxy(
        {} as MessageProxy,
        {
            get(_target, prop: PropertyKey): any {
                // 仅在属性名是字符串并且等于 'setMessageApi' 时，直接返回内部函数
                if (typeof prop === 'string' && prop === 'setMessageApi') return setMessageApi;

                // 将非字符串（symbol 等）安全转换成字符串再转发
                const methodName = typeof prop === 'string' ? prop : String(prop);
                return (...args: any[]) => callAntdMessage(methodName, args);
            },
        },
    );
};

export const ZMessage = createProxy();
export const showError = (content: string, duration?: number) => ZMessage.error(content, duration);
export const showSuccess = (content: string, duration?: number) => ZMessage.success(content, duration);
export const clear = () => ZMessage.destroy && ZMessage.destroy();

export default ZMessage;
