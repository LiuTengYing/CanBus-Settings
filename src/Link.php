<?php

namespace Ltydi\CanBusSettings;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Link extends AbstractModel
{
    /**
     * {@inheritdoc}
     */
    protected $table = 'canbus_links';

    /**
     * {@inheritdoc}
     */
    protected $fillable = ['url', 'config_id', 'description'];

    /**
     * {@inheritdoc}
     */
    protected $dates = ['created_at', 'updated_at'];

    /**
     * 获取此链接所属的配置
     */
    public function config(): BelongsTo
    {
        return $this->belongsTo(Config::class);
    }
} 