<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\ConfigSerializer;
use Ltydi\CanBusSettings\Config;

class ListConfigsController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = ConfigSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 获取查询参数中的 year_id
        $yearId = Arr::get($request->getQueryParams(), 'filter.year_id');
        error_log('Listing configs for year ID: ' . ($yearId ?? 'null'));
        
        // 如果没有提供 year_id，返回空数组
        if (!$yearId) {
            error_log('No year_id provided, returning empty array');
            return [];
        }
        
        $query = Config::query();
        $query->where('year_id', $yearId);
        
        $configs = $query->get();
        error_log('Found ' . count($configs) . ' configs for year ID ' . $yearId);
        
        return $configs;
    }
} 