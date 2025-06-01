<?php

namespace Ltydi\CanBusSettings\Models;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Config extends AbstractModel
{
    protected $table = 'canbus_configs';

    protected $fillable = ['name', 'year_id'];

    /**
     * 获取该配置所属的年份
     */
    public function year(): BelongsTo
    {
        return $this->belongsTo(Year::class);
    }

    /**
     * 获取该配置下的所有链接
     */
    public function links(): HasMany
    {
        return $this->hasMany(Link::class, 'config_id');
    }
} 