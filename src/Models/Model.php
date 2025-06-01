<?php

namespace Ltydi\CanBusSettings\Models;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Model extends AbstractModel
{
    protected $table = 'canbus_models';

    protected $fillable = ['name', 'brand_id'];

    /**
     * 获取该车型所属的品牌
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * 获取该车型下的所有年份
     */
    public function years(): HasMany
    {
        return $this->hasMany(Year::class, 'model_id');
    }
} 