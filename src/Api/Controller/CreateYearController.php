<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\YearSerializer;
use Ltydi\CanBusSettings\Year;
use Ltydi\CanBusSettings\Model;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class CreateYearController extends AbstractCreateController
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
        
        // 获取请求数据
        $requestBody = $request->getParsedBody();
        error_log('Year request body: ' . json_encode($requestBody));
        
        // 获取URL参数
        $queryParams = $request->getQueryParams();
        error_log('Year query params: ' . json_encode($queryParams));
        
        // 尝试从URL参数中获取年份范围和车型ID
        $yearRange = Arr::get($queryParams, 'year_range');
        $modelId = Arr::get($queryParams, 'model_id');
        
        // 如果URL参数中没有，尝试从请求体中获取
        if (empty($yearRange) || empty($modelId)) {
            $data = Arr::get($requestBody, 'data', []);
            $attributes = Arr::get($data, 'attributes', []);
            $relationships = Arr::get($data, 'relationships', []);
            
            $yearRange = $yearRange ?: Arr::get($attributes, 'year_range');
            
            // 尝试从 relationships 中获取 model_id
            if (empty($modelId) && isset($relationships['model']['data']['id'])) {
                $modelId = $relationships['model']['data']['id'];
                error_log('Extracted model_id from relationships: ' . $modelId);
            } else {
                $modelId = $modelId ?: Arr::get($attributes, 'model_id');
            }
        }
        
        error_log('Final year_range: ' . ($yearRange ?? 'null'));
        error_log('Final model_id: ' . ($modelId ?? 'null'));
        
        // 如果仍然为空，使用硬编码的值进行测试
        if (empty($yearRange)) {
            $yearRange = '2020-2023';
            error_log('Using default year_range: ' . $yearRange);
        }
        
        if (empty($modelId)) {
            // 尝试获取第一个车型的ID
            $model = Model::first();
            
            if (!$model) {
                error_log('No model records available');
                throw new ValidationException([
                    'model_id' => 'No model records available. Please add a model first.'
                ]);
            }
            
            $modelId = $model->id;
            error_log('Using first model_id: ' . $modelId);
        } else {
            // 验证提供的车型ID是否存在
            $model = Model::find($modelId);
            
            if (!$model) {
                error_log('Model with ID ' . $modelId . ' not found');
                throw new ValidationException([
                    'model_id' => 'The specified model does not exist.'
                ]);
            }
            
            error_log('Found model: ' . $model->id . ' - ' . $model->name);
        }
        
        // 检查是否已存在相同年份范围和车型ID的记录
        $existingYear = Year::where('year_range', $yearRange)
            ->where('model_id', $modelId)
            ->first();
            
        if ($existingYear) {
            error_log('Year with range "' . $yearRange . '" already exists for model ID ' . $modelId);
            return $existingYear;
        }
        
        // 创建新年份记录
        $year = new Year();
        $year->year_range = $yearRange;
        $year->model_id = $modelId;
        $year->created_at = Carbon::now();
        $year->updated_at = Carbon::now();
        $year->save();
        
        error_log('Created new year with ID ' . $year->id . ' and range "' . $year->year_range . '" for model ID ' . $year->model_id);
        
        return $year;
    }
} 