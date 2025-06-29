<?php

namespace Ltydi\CanBusSettings\Models;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Link extends AbstractModel
{
    protected $table = 'canbus_links';

    protected $fillable = ['url', 'config_id'];

    /**
     * 获取该链接所属的配置
     */
    public function config(): BelongsTo
    {
        return $this->belongsTo(Config::class);
    }
} 