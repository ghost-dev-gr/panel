import React from 'react';
import { Proxy } from '@/api/server/proxy/getServerProxies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import Can from '@/components/elements/Can';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import DeleteProxyButton from '@/components/server/proxy/DeleteProxyButton';
import { ip } from '@/lib/formatters';

interface Props {
    proxy: Proxy;
    proxies: Proxy[];
    setProxies: any;
    className?: string;
}

export default ({ proxy, proxies, setProxies, className }: Props) => {
    return (
        <GreyRowBox $hoverable={false} className={className} css={tw`mb-2`}>
            <div css={tw`hidden md:block`}>
                <FontAwesomeIcon icon={faRoute} fixedWidth />
            </div>
            <div css={tw`flex-1 ml-4`}>
                <p css={tw`text-lg`}>{proxy.domain}</p>
            </div>
            <div css={tw`ml-8 text-center block`}>
                <p css={tw`text-sm`}>
                    {proxy.allocation?.alias || ip(proxy.allocation?.ip)}:{proxy.allocation?.port}
                </p>
                <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Host</p>
            </div>
            <div css={tw`ml-8 text-center hidden md:block`}>
                <p css={tw`text-sm`}>{proxy.sslEnabled ? 'Yes' : 'No'}</p>
                <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>SSL Enabled</p>
            </div>
            <div css={tw`ml-8`}>
                <Can action={'proxy.delete'}>
                    <DeleteProxyButton proxyId={proxy.id} proxies={proxies} setProxies={setProxies} />
                </Can>
            </div>
        </GreyRowBox>
    );
};
