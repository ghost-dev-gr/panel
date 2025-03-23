import React, { useEffect, useState } from 'react';
import getServerProxies, { Proxy } from '@/api/server/proxy/getServerProxies';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import ProxyRow from '@/components/server/proxy/ProxyRow';
import { httpErrorToHuman } from '@/api/http';
import CreateProxyButton from '@/components/server/proxy/CreateProxyButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlash();
    const [loading, setLoading] = useState(true);

    const proxyLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.proxies);
    const [proxies, setProxies] = useState<Proxy[]>([]);

    useEffect(() => {
        clearFlashes('proxy');
        getServerProxies(uuid)
            .then((proxies) => setProxies(proxies))
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'proxy' });
                console.error(error);
            })
            .then(() => setLoading(false));
    }, []);

    if (loading) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <ServerContentBlock title={'Proxy'}>
            <FlashMessageRender byKey={'proxy'} css={tw`mb-4`} />
            {proxyLimit === 0 ? (
                <p css={tw`text-center text-sm text-neutral-300`}>
                    Reverse proxies cannot be created for this server because the proxy limit is set to 0.
                </p>
            ) : proxies.length < 1 ? (
                <p css={tw`text-center text-sm text-neutral-300`}>
                    It looks like there are no reverse proxies currently running for this server.
                </p>
            ) : (
                proxies.map((proxy, index) => (
                    <ProxyRow
                        key={proxy.id}
                        proxy={proxy}
                        proxies={proxies}
                        setProxies={setProxies}
                        className={index > 0 ? 'mt-2' : undefined}
                    />
                ))
            )}
            <Can action={'proxy.create'}>
                <div css={tw`mt-6 sm:flex items-center justify-end`}>
                    {proxyLimit > 0 && proxies.length > 0 && (
                        <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                            {proxies.length} of {proxyLimit} proxies have been created for this server.
                        </p>
                    )}
                    {proxyLimit > 0 && proxyLimit > proxies.length && (
                        <CreateProxyButton proxies={proxies} setProxies={setProxies} className={'w-full sm:w-auto'} />
                    )}
                </div>
            </Can>
        </ServerContentBlock>
    );
};
