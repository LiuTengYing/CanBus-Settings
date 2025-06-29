<?php

namespace Ltydi\CanBusSettings\Models;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends AbstractModel
{
    protected $table = 'canbus_brands';

    protected $fillable = ['name'];

    /**
     * 获取该品牌下的所有车型
     */
    public function models(): HasMany
    {
        return $this->hasMany(Model::class, 'brand_id');
    }
} 