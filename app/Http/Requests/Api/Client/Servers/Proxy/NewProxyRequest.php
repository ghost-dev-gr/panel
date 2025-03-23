<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Proxy;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class NewProxyRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'proxy.create';
    }
}
