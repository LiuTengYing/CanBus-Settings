<?php

namespace Ltydi\CanBusSettings\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Model;
use Carbon\Carbon;

class ModelSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'canbus-models';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($model)
    {
        if (!($model instanceof Model)) {
            return [];
        }

        // 确保日期是DateTime对象
        $createdAt = $model->created_at instanceof \DateTime ? $model->created_at : new Carbon($model->created_at);
        $updatedAt = $model->updated_at instanceof \DateTime ? $model->updated_at : new Carbon($model->updated_at);

        return [
            'name' => $model->name,
            'brand_id' => $model->brand_id,
            'created_at' => $this->formatDate($createdAt),
            'updated_at' => $this->formatDate($updatedAt)
        ];
    }
}