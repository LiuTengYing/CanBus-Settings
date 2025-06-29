<?php

namespace Ltydi\CanBusSettings\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Models\Year;
use Carbon\Carbon;

class YearSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'canbus-years';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($year)
    {
        if (!($year instanceof Year)) {
            return [];
        }

        // 确保日期是DateTime对象
        $createdAt = $year->created_at instanceof \DateTime ? $year->created_at : new Carbon($year->created_at);
        $updatedAt = $year->updated_at instanceof \DateTime ? $year->updated_at : new Carbon($year->updated_at);

        return [
            'id' => $year->id,
            'yearRange' => $year->year_range,
            'modelId' => $year->model_id,
            'createdAt' => $this->formatDate($createdAt),
            'updatedAt' => $this->formatDate($updatedAt)
        ];
    }
} 