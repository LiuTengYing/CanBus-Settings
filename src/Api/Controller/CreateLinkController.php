<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\LinkSerializer;
use Ltydi\CanBusSettings\Link;
use Ltydi\CanBusSettings\Config;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class CreateLinkController extends AbstractCreateController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = LinkSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        $data = $request->getParsedBody();
        error_log('Creating link with data: ' . json_encode($data));
        
        $attributes = Arr::get($data, 'data.attributes', []);
        $relationships = Arr::get($data, 'data.relationships', []);
        
        // 验证URL
        if (empty($attributes['url'])) {
            throw new ValidationException(['message' => 'Link URL cannot be empty']);
        }
        
        // 验证配置ID
        $configId = Arr::get($relationships, 'config.data.id');
        if (empty($configId)) {
            throw new ValidationException(['message' => 'Config ID cannot be empty']);
        }
        
        error_log('Creating link with URL: ' . $attributes['url'] . ' for config ID: ' . $configId);
        
        // 检查是否已存在链接
        $existingLink = Link::where('config_id', $configId)->first();
        if ($existingLink) {
            throw new ValidationException(['message' => 'A link already exists for this configuration']);
        }
        
        $link = new Link();
        $link->url = $attributes['url'];
        $link->config_id = $configId;
        $link->save();
        
        return $link;
    }
} 