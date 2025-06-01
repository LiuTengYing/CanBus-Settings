<?php

namespace Ltydi\CanBusSettings;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Model extends AbstractModel
{
    /**
     * {@inheritdoc}
     */
    protected $table = 'canbus_models';

    /**
     * {@inheritdoc}
     */
    protected $fillable = ['name', 'brand_id'];

    /**
     * {@inheritdoc}
     */
    protected $dates = ['created_at', 'updated_at'];

    /**
     * 获取此车型所属的品牌
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * 获取此车型的所有年份
     */
    public function years(): HasMany
    {
        return $this->hasMany(Year::class);
    }
} 