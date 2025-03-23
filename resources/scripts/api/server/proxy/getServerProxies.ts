import http from '@/api/http';
import { Allocation } from '@/api/server/getServer';

export interface Proxy {
    id: number;
    domain: string;
    allocation: Allocation;
    sslEnabled: boolean;
}

export const rawDataToServerProxy = (data: any): Proxy => ({
    id: data.id,
    domain: data.domain,
    allocation: data.allocation,
    sslEnabled: data.ssl_enabled,
});

export default async (uuid: string): Promise<Proxy[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/proxy`);

    return (data || []).map((prox: any) => rawDataToServerProxy(prox));
};
