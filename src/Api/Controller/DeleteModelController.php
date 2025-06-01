<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Ltydi\CanBusSettings\Model;
use Flarum\Foundation\ValidationException;

class DeleteModelController extends AbstractDeleteController
{
    /**
     * {@inheritdoc}
     */
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        $modelId = Arr::get($request->getAttributes(), 'id');
        
        // 记录请求信息用于调试
        error_log('DeleteModelController - Request attributes: ' . json_encode($request->getAttributes()));
        error_log('DeleteModelController - Model ID from attributes: ' . $modelId);
        
        // 尝试从路由参数获取ID
        $routeParams = $request->getAttribute('routeParameters', []);
        if (isset($routeParams['id'])) {
            $modelId = $routeParams['id'];
            error_log('DeleteModelController - Model ID from route parameters: ' . $modelId);
        }
        
        // 检查模型ID是否存在
        if (!$modelId) {
            error_log('DeleteModelController - Model ID is empty');
            throw new ValidationException([
                'id' => 'Model ID cannot be empty'
            ]);
        }
        
        // 尝试查找模型
        $model = Model::find($modelId);
        
        if (!$model) {
            error_log('DeleteModelController - Model with ID ' . $modelId . ' not found');
            throw new ValidationException([
                'id' => 'Model with ID ' . $modelId . ' not found'
            ]);
        }
        
        error_log('DeleteModelController - Found model: ' . $model->id . ' - ' . $model->name);
        
        // 检查是否有年份依赖于此模型
        if ($model->years()->count() > 0) {
            error_log('DeleteModelController - Deleting ' . $model->years()->count() . ' related years');
            // 如果有依赖，可以选择抛出异常或级联删除
            // 这里选择级联删除
            foreach ($model->years as $year) {
                // 检查是否有配置依赖于此年份
                if ($year->configs()->count() > 0) {
                    error_log('DeleteModelController - Deleting configs for year ' . $year->id);
                    $year->configs()->delete();
                }
            }
            $model->years()->delete();
        }
        
        error_log('DeleteModelController - Deleting model with ID: ' . $model->id);
        $model->delete();
        error_log('DeleteModelController - Model deleted successfully');
    }
} 