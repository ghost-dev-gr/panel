import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import deleteServerProxy from '@/api/server/proxy/deleteServerProxy';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Proxy } from '@/api/server/proxy/getServerProxies';

interface Props {
    proxyId: number;
    proxies: Proxy[];
    setProxies: any;
}

export default ({ proxyId, proxies, setProxies }: Props) => {
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const onDelete = () => {
        setIsLoading(true);
        clearFlashes('proxy');
        deleteServerProxy(uuid, proxyId)
            .then(() => {
                setProxies(proxies.filter((proxy: Proxy) => proxy.id !== proxyId));
                setIsLoading(false);
                setVisible(false);
            })
            .catch((error) => {
                console.error(error);

                addError({ key: 'proxy', message: httpErrorToHuman(error) });
                setIsLoading(false);
                setVisible(false);
            });
    };

    return (
        <>
            <Dialog.Confirm
                open={visible}
                onClose={() => setVisible(false)}
                title={'Delete Proxy'}
                confirm={'Delete'}
                onConfirmed={onDelete}
            >
                <SpinnerOverlay visible={isLoading} />
                This proxy will be deleted.
            </Dialog.Confirm>
            <Button.Danger
                variant={Button.Variants.Secondary}
                className={'flex-1 sm:flex-none mr-4 border-transparent'}
                onClick={() => setVisible(true)}
            >
                <FontAwesomeIcon icon={faTrashAlt} fixedWidth />
            </Button.Danger>
        </>
    );
};
