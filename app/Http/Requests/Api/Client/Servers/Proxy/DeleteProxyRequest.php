<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Proxy;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class DeleteProxyRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'proxy.delete';
    }
}
