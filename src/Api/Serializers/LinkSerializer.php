<?php

namespace Ltydi\CanBusSettings\Api\Serializers;

use Flarum\Api\Serializer\AbstractSerializer;
use Ltydi\CanBusSettings\Models\Link;
use Carbon\Carbon;

class LinkSerializer extends AbstractSerializer
{
    /**
     * {@inheritdoc}
     */
    protected $type = 'canbus-links';

    /**
     * {@inheritdoc}
     */
    protected function getDefaultAttributes($link)
    {
        if (!($link instanceof Link)) {
            return [];
        }

        // 确保日期是DateTime对象
        $createdAt = $link->created_at instanceof \DateTime ? $link->created_at : new Carbon($link->created_at);
        $updatedAt = $link->updated_at instanceof \DateTime ? $link->updated_at : new Carbon($link->updated_at);

        return [
            'id' => $link->id,
            'url' => $link->url,
            'configId' => $link->config_id,
            'createdAt' => $this->formatDate($createdAt),
            'updatedAt' => $this->formatDate($updatedAt)
        ];
    }
} 