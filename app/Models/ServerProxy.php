<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $server_id
 * @property string $domain
 * @property int $allocation_id
 * @property bool $ssl_enabled
 * @property \Pterodactyl\Models\Server $server
 * @property \Pterodactyl\Models\Allocation $allocation
 */
class ServerProxy extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'server_proxy';

    /**
     * Disable timestamps on this model.
     */
    public $timestamps = false;

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'server_id',
        'domain',
        'allocation_id',
        'ssl_enabled',
    ];

    /**
     * The default relationships to load for all serverproxy models.
     */
    protected $with = ['allocation'];

    public static array $validationRules = [
        'server_id' => 'required|numeric|exists:servers,id',
        'domain' => 'required|string',
        'allocation_id' => 'required|numeric|exists:allocations,id',
        'ssl_enabled' => 'required|boolean',
    ];

    /**
     * Gets the server associated with this proxy.
     */
    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    /**
     * Gets the allocation associated with this proxy.
     */
    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class);
    }
}
