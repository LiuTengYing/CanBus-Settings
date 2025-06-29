<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\YearSerializer;
use Ltydi\CanBusSettings\Year;

class ListYearsController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = YearSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 获取查询参数中的 model_id
        $modelId = Arr::get($request->getQueryParams(), 'filter.model_id');
        error_log('Listing years for model ID: ' . ($modelId ?? 'null'));
        
        // 如果没有提供 model_id，返回空数组
        if (!$modelId) {
            error_log('No model_id provided, returning empty array');
            return [];
        }
        
        $query = Year::query();
        $query->where('model_id', $modelId);
        
        $years = $query->get();
        error_log('Found ' . count($years) . ' years for model ID ' . $modelId);
        
        return $years;
    }
} 