<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\ModelSerializer;
use Ltydi\CanBusSettings\Model;

class ListModelsController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = ModelSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 获取查询参数
        $params = $request->getQueryParams();
        $brandId = Arr::get($params, 'filter.brand_id');
        
        // 查询模型
        $query = Model::query();
        
        // 如果指定了品牌ID，则按品牌ID过滤
        if ($brandId) {
            $query->where('brand_id', $brandId);
        }
        
        return $query->get();
    }
} 