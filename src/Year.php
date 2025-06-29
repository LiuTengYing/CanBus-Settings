<?php

namespace Ltydi\CanBusSettings;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Year extends AbstractModel
{
    /**
     * {@inheritdoc}
     */
    protected $table = 'canbus_years';

    /**
     * {@inheritdoc}
     */
    protected $fillable = ['year_range', 'model_id'];

    /**
     * {@inheritdoc}
     */
    protected $dates = ['created_at', 'updated_at'];

    /**
     * 获取此年份所属的车型
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(Model::class);
    }

    /**
     * 获取此年份的所有配置
     */
    public function configs(): HasMany
    {
        return $this->hasMany(Config::class);
    }
} 