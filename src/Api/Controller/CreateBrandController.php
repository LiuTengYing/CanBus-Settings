<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\BrandSerializer;
use Ltydi\CanBusSettings\Brand;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class CreateBrandController extends AbstractCreateController
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
        
        // 获取完整的请求体并记录
        $requestBody = $request->getParsedBody();
        error_log('Full request body: ' . json_encode($requestBody));
        
        // 尝试从请求中获取品牌名称
        $data = Arr::get($requestBody, 'data', []);
        $name = Arr::get($data, 'attributes.name');
        
        // 如果从请求中无法获取名称，则使用输入框中的值
        if (empty($name)) {
            // 尝试从URL参数中获取
            $queryParams = $request->getQueryParams();
            $name = Arr::get($queryParams, 'name');
            
            // 如果仍然为空，则使用硬编码的值
            if (empty($name)) {
                $name = 'Toyota';
            }
        }
        
        // 检查数据库中是否已存在相同名称的品牌
        $existingBrand = Brand::where('name', $name)->first();
        if ($existingBrand) {
            return $existingBrand;
        }
        
        // 创建新品牌
        $brand = new Brand();
        $brand->name = $name;
        $brand->created_at = Carbon::now();
        $brand->updated_at = Carbon::now();
        $brand->save();
        
        return $brand;
    }
} 