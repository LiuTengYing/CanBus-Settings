<?php

namespace Ltydi\CanBusSettings\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Year;
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
            'year_range' => $year->year_range,
            'model_id' => $year->model_id,
            'created_at' => $this->formatDate($createdAt),
            'updated_at' => $this->formatDate($updatedAt)
        ];
    }
} 