<?php

namespace Ltydi\CanBusSettings;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends AbstractModel
{
    /**
     * {@inheritdoc}
     */
    protected $table = 'canbus_brands';

    /**
     * {@inheritdoc}
     */
    protected $fillable = ['name'];

    /**
     * 获取与该品牌关联的所有车型
     */
    public function models(): HasMany
    {
        return $this->hasMany(Model::class);
    }
} 