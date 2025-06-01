<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\ConfigSerializer;
use Ltydi\CanBusSettings\Config;
use Ltydi\CanBusSettings\Year;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class CreateConfigController extends AbstractCreateController
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
        
        // 获取请求数据
        $data = $request->getParsedBody();
        error_log('Entire request body: ' . json_encode($data));
        
        // 从请求体中获取数据
        $attributes = Arr::get($data, 'data.attributes', []);
        error_log('Attributes from request body: ' . json_encode($attributes));
        
        // 获取配置名称
        $name = Arr::get($attributes, 'name');
        error_log('Extracted name: ' . ($name ?? 'null'));
        
        // 从关系中获取年份ID
        $yearId = Arr::get($data, 'data.relationships.year.data.id');
        error_log('Year ID from relationships: ' . ($yearId ?? 'null'));
        
        // 检查配置名称是否为空
        if (empty($name)) {
            error_log('CreateConfigController - Configuration name is empty');
            throw new ValidationException([
                'name' => 'Configuration name cannot be empty'
            ]);
        }
        
        // 检查年份ID是否为空
        if (empty($yearId)) {
            error_log('CreateConfigController - Year ID is empty');
            throw new ValidationException([
                'year_id' => 'Year ID cannot be empty. Please select a year first.'
            ]);
        }
        
        // 验证提供的年份ID是否存在
        $year = Year::find($yearId);
        
        if (!$year) {
            error_log('CreateConfigController - Year with ID ' . $yearId . ' not found');
            throw new ValidationException([
                'year_id' => 'The specified year does not exist.'
            ]);
        }
        
        // 检查是否已存在相同名称和年份ID的配置
        $existingConfig = Config::where('name', $name)
            ->where('year_id', $yearId)
            ->first();
            
        if ($existingConfig) {
            error_log('CreateConfigController - Configuration with name "' . $name . '" already exists for year ID ' . $yearId);
            throw new ValidationException([
                'name' => 'A configuration with this name already exists for this year.'
            ]);
        }
        
        // 创建新配置
        $config = new Config();
        $config->name = $name;
        $config->year_id = $yearId;
        $config->created_at = Carbon::now();
        $config->updated_at = Carbon::now();
        $config->save();
        
        error_log('CreateConfigController - Created new configuration with ID ' . $config->id . ' and name "' . $config->name . '"');
        
        return $config;
    }
} 