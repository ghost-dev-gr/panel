<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Models\Allocation;
use Illuminate\Support\Facades\Log;
use Pterodactyl\Models\ServerProxy;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Proxy\NewProxyRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\Proxy\DeleteProxyRequest;

class ProxyController extends ClientApiController
{
    /**
     * ProxyController constructor.
     */
    public function __construct(private DaemonServerRepository $daemonServerRepository)
    {
        parent::__construct();
    }

    /**
     * List all of the proxies from a server
     */
    public function index(Request $request, Server $server)
    {
        $proxies = ServerProxy::query()->where("server_id", $server->id)->get();

        return response()->json($proxies);
    }

    /**
     * Create a new proxy
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function create(NewProxyRequest $request, Server $server)
    {
        $domain = $request->get("domain");
        $allocation = Allocation::query()->where("id", $request->get("allocation_id"))->first();
        $ssl_enabled = $request->get("ssl_enabled");
        $use_lets_encrypt = $request->get("use_lets_encrypt");
        $ssl_cert = $request->get("ssl_cert");
        $ssl_key = $request->get("ssl_key");

        if (is_null($ssl_cert)) $ssl_cert = "";
        if (is_null($ssl_key)) $ssl_key = "";

        if (ServerProxy::query()->where("domain", $domain)->exists()) {
            throw new DisplayException('There is already a proxy active for that domain.');
        }

        if ($domain == $server->node->fqdn) {
            throw new DisplayException('The domain cannot be the same as the node FQDN.');
        }

        $client_email = $request->user()->email;

        $this->daemonServerRepository->setServer($server)->createProxy($domain, $allocation->alias ?? $allocation->ip, $allocation->port, $ssl_enabled, $use_lets_encrypt, $client_email, $ssl_cert, $ssl_key);

        $proxy = ServerProxy::create([
            "server_id" => $server->id,
            "domain" => $domain,
            "allocation_id" => $allocation->id,
            "ssl_enabled" => $ssl_enabled,
        ]);

        Activity::event('server:proxy.create')
            ->property([
                'domain' => $domain,
                'allocation' => $allocation->ip . ":" . $allocation->port,
                'ssl_enabled' => $ssl_enabled
            ])
            ->log();

        return response()->json($proxy->fresh());
    }

    /**
     * Delete a proxy
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Pterodactyl\Exceptions\DisplayException
     */
    public function delete(DeleteProxyRequest $request, Server $server, $id)
    {
        $proxy = ServerProxy::query()
            ->where("id", $id)
            ->where("server_id", $server->id)
            ->first();

        $allocation = Allocation::query()->where("id", $proxy->allocation_id)->first();

        try {
            $this->daemonServerRepository->setServer($server)->deleteProxy($proxy->domain, $allocation->port);
        } catch (\Exception $exception) {
            Log::warning($exception);
        }

        Activity::event('server:proxy.delete')
            ->property([
                'domain' => $proxy->domain,
                'allocation' => $allocation->ip . ":" . $allocation->port,
                'ssl_enabled' => $proxy->ssl_enabled
            ])
            ->log();

        $proxy->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}
