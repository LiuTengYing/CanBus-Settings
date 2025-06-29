<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\LinkSerializer;
use Ltydi\CanBusSettings\Link;

class ListLinksController extends AbstractListController
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
        
        // 可以根据需要添加权限检查
        // $this->assertCan($actor, 'viewCanBusLinks');
        
        // 获取查询参数中的 config_id
        $configId = Arr::get($request->getQueryParams(), 'filter.config_id');
        error_log('Listing links for config ID: ' . ($configId ?? 'null'));
        
        // 如果没有提供 config_id，返回空数组
        if (!$configId) {
            error_log('No config_id provided, returning empty array');
            return [];
        }
        
        $query = Link::query();
        $query->where('config_id', $configId);
        
        $links = $query->get();
        error_log('Found ' . count($links) . ' links for config ID ' . $configId);
        
        return $links;
    }
} 