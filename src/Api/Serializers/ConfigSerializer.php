<?php

namespace Ltydi\CanBusSettings\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Models\Config;
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
            'yearId' => $config->year_id,
            'createdAt' => $this->formatDate($createdAt),
            'updatedAt' => $this->formatDate($updatedAt)
        ];
    }
} 