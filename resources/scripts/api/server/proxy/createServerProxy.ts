import { rawDataToServerProxy, Proxy } from '@/api/server/proxy/getServerProxies';
import http from '@/api/http';

type Data = Pick<Proxy, 'domain' | 'sslEnabled'> & {
    allocationId?: number;
    sslCert?: string;
    sslKey?: string;
    useLetsEncrypt?: boolean;
};

export default (uuid: string, proxy: Data): Promise<Proxy> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/proxy/create`, {
            domain: proxy.domain,
            allocation_id: proxy.allocationId,
            ssl_enabled: proxy.sslEnabled,
            use_lets_encrypt: proxy.useLetsEncrypt,
            ssl_cert: proxy.sslCert,
            ssl_key: proxy.sslKey,
        })
            .then(({ data }) => resolve(rawDataToServerProxy(data)))
            .catch(reject);
    });
};
