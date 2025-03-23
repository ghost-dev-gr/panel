import http from '@/api/http';

export default (uuid: string, proxy: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/proxy/delete/${proxy}`)
            .then(() => resolve())
            .catch(reject);
    });
};
