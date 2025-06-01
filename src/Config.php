<?php

namespace Ltydi\CanBusSettings;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Config extends AbstractModel
{
    /**
     * {@inheritdoc}
     */
    protected $table = 'canbus_configs';

    /**
     * {@inheritdoc}
     */
    protected $dates = ['created_at', 'updated_at'];
    
    /**
     * {@inheritdoc}
     */
    protected $fillable = ['name', 'year_id'];

    /**
     * 获取此配置所属的年份
     */
    public function year(): BelongsTo
    {
        return $this->belongsTo(Year::class);
    }

    /**
     * 获取此配置的链接
     */
    public function link(): HasOne
    {
        return $this->hasOne(Link::class);
    }
} 