<?php

namespace Ltydi\CanBusSettings\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Brand;
use Carbon\Carbon;

class BrandSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'canbus-brands';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($brand)
    {
        if (!($brand instanceof Brand)) {
            return [];
        }

        // 确保日期是DateTime对象
        $createdAt = $brand->created_at instanceof \DateTime ? $brand->created_at : new Carbon($brand->created_at);
        $updatedAt = $brand->updated_at instanceof \DateTime ? $brand->updated_at : new Carbon($brand->updated_at);

        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'created_at' => $this->formatDate($createdAt),
            'updated_at' => $this->formatDate($updatedAt)
        ];
    }
} 