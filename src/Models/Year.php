<?php

namespace Ltydi\CanBusSettings\Models;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Year extends AbstractModel
{
    protected $table = 'canbus_years';

    protected $fillable = ['year_range', 'model_id'];

    /**
     * 获取该年份所属的车型
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(Model::class);
    }

    /**
     * 获取该年份下的所有配置
     */
    public function configs(): HasMany
    {
        return $this->hasMany(Config::class, 'year_id');
    }
} 