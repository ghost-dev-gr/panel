import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Field as FormikField, Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { boolean, number, object, string } from 'yup';
import { ip } from '@/lib/formatters';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Dialog } from '@/components/elements/dialog';
import createServerProxy from '@/api/server/proxy/createServerProxy';
import isEqual from 'react-fast-compare';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import { Textarea } from '@/components/elements/Input';
import FormikSwitch from '@/components/elements/FormikSwitch';
import { Proxy } from '@/api/server/proxy/getServerProxies';

interface Values {
    domain: string;
    allocationId: number;
    sslEnabled: boolean;
    useLetsEncrypt?: boolean;
    sslCert?: string;
    sslKey?: string;
}

const schema = object().shape({
    domain: string()
        .required('A valid domain must be given.')
        .matches(/^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+\.?)$/i, {
            message: 'A valid domain must be given.',
        }),
    allocationId: number(),
    sslEnabled: boolean(),
    useLetsEncrypt: boolean().when('sslEnabled', {
        is: true,
        then: boolean().required("You must specify whether or not to use Let's Encrypt."),
        otherwise: boolean(),
    }),
    sslCert: string().when(['sslEnabled', 'useLetsEncrypt'], {
        is: (sslEnabled, useLetsEncrypt) => sslEnabled && !useLetsEncrypt,
        then: string()
            .required('A valid ssl certificate must be given.')
            .matches(/(-----BEGIN CERTIFICATE-----(?:[\s\S]*?)-----END CERTIFICATE-----)/, {
                message: 'A valid ssl certificate must be given.',
            }),
        otherwise: string(),
    }),
    sslKey: string().when(['sslEnabled', 'useLetsEncrypt'], {
        is: (sslEnabled, useLetsEncrypt) => sslEnabled && !useLetsEncrypt,
        then: string()
            .required('A valid ssl key must be given.')
            .matches(/(-----BEGIN PRIVATE KEY-----(?:[\s\S]*?)-----END PRIVATE KEY-----)/, {
                message: 'A valid ssl key must be given.',
            }),
        otherwise: string(),
    }),
});

export default ({ proxies, setProxies, className }: { proxies: Proxy[]; setProxies: any; className: string }) => {
    const [open, setOpen] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);

    const { clearAndAddHttpError } = useFlashKey('proxy:create-modal');

    useEffect(() => {
        return () => {
            clearAndAddHttpError();
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        createServerProxy(uuid, {
            domain: values.domain,
            allocationId: values.allocationId,
            sslEnabled: values.sslEnabled,
            useLetsEncrypt: values.useLetsEncrypt,
            sslCert: values.sslCert,
            sslKey: values.sslKey,
        })
            .then((proxy) => {
                setProxies([...proxies, proxy]);
                setSubmitting(false);
                setOpen(false);
                clearAndAddHttpError();
            })
            .catch((error) => {
                setSubmitting(false);
                clearAndAddHttpError(error);
            });
    };

    return (
        <>
            <Dialog title={'Create new proxy'} open={open} onClose={() => setOpen(false)}>
                <Formik
                    onSubmit={submit}
                    validationSchema={schema}
                    initialValues={
                        {
                            domain: '',
                            allocationId: allocations.find((allocation) => allocation.isDefault)?.id,
                            sslEnabled: true,
                            useLetsEncrypt: true,
                            sslCert: '',
                            sslKey: '',
                        } as Values
                    }
                >
                    {({ submitForm, values }) => (
                        <>
                            <FlashMessageRender key={'proxy:create-modal'} />
                            <Form css={tw`m-0`}>
                                <Field
                                    autoFocus
                                    name={'domain'}
                                    label={'Proxy domain'}
                                    description={'The domain that the proxy needs to point to.'}
                                />
                                <div css={tw`mt-6`}>
                                    <Label>Allocation</Label>
                                    <FormikFieldWrapper name={'allocation'}>
                                        <FormikField as={Select} name={'allocationId'}>
                                            {allocations.map((allocation) => (
                                                <option key={allocation.id} value={allocation.id}>
                                                    {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                </option>
                                            ))}
                                        </FormikField>
                                    </FormikFieldWrapper>
                                </div>
                                <div css={tw`mt-6 bg-neutral-600 border border-neutral-500 p-4 rounded`}>
                                    <FormikSwitch
                                        name={'sslEnabled'}
                                        description={'A SSL certificate will be created for this proxy'}
                                        label={'Enable SSL'}
                                    />
                                </div>
                                {values.sslEnabled && (
                                    <>
                                        <div css={tw`mt-6 bg-neutral-600 border border-neutral-500 p-4 rounded`}>
                                            <FormikSwitch
                                                name={'useLetsEncrypt'}
                                                description={
                                                    "Use Let's Encrypt to automatically generate a SSL certificate for this proxy."
                                                }
                                                label={"Use Let's Encrypt"}
                                            />
                                        </div>
                                        {!values.useLetsEncrypt && (
                                            <>
                                                <div css={tw`mt-6`}>
                                                    <Label>SSL Certificate</Label>
                                                    <FormikFieldWrapper
                                                        name={'sslCert'}
                                                        description={'The certificated used for SSL'}
                                                    >
                                                        <FormikField as={Textarea} name={'sslCert'} rows={6} />
                                                    </FormikFieldWrapper>
                                                </div>
                                                <div css={tw`mt-4`}>
                                                    <Label>SSL Key</Label>
                                                    <FormikFieldWrapper
                                                        name={'sslKey'}
                                                        description={'The key used for SSL'}
                                                    >
                                                        <FormikField as={Textarea} name={'sslKey'} rows={6} />
                                                    </FormikFieldWrapper>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </Form>
                            <Dialog.Footer>
                                <Button.Text className={'w-full sm:w-auto'} onClick={() => setOpen(false)}>
                                    Cancel
                                </Button.Text>
                                <Button className={'w-full sm:w-auto'} onClick={submitForm}>
                                    Create
                                </Button>
                            </Dialog.Footer>
                        </>
                    )}
                </Formik>
            </Dialog>
            <Button onClick={setOpen.bind(this, true)} className={className}>
                Create Proxy
            </Button>
        </>
    );
};
