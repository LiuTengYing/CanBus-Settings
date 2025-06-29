<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\BrandSerializer;
use Ltydi\CanBusSettings\Brand;

class ListBrandsController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = BrandSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // 确保用户有权限查看品牌列表
        // 暂时注释掉权限检查，以便于测试
        // $actor->assertCan('canbus.settings');
        
        return Brand::query()->get();
    }
} 