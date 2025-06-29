<?php

namespace Ltydi\CanBusSettings\Api\Controllers;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializers\BrandSerializer;
use Ltydi\CanBusSettings\Models\Brand;

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
        
        // 确保用户有权限查看
        $actor->assertCan('viewForum');

        return Brand::all();
    }
} 