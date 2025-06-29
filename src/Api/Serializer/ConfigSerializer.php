<?php

namespace Ltydi\CanBusSettings\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Config;
use Carbon\Carbon;

class ConfigSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'canbus-configs';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($config)
    {
        if (!($config instanceof Config)) {
            return [];
        }

        // 确保日期是DateTime对象
        $createdAt = $config->created_at instanceof \DateTime ? $config->created_at : new Carbon($config->created_at);
        $updatedAt = $config->updated_at instanceof \DateTime ? $config->updated_at : new Carbon($config->updated_at);

        return [
            'id' => $config->id,
            'name' => $config->name,
            'year_id' => $config->year_id,
            'created_at' => $this->formatDate($createdAt),
            'updated_at' => $this->formatDate($updatedAt)
        ];
    }
} 