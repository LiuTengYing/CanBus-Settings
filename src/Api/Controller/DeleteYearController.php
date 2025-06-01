<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Ltydi\CanBusSettings\Year;
use Flarum\Api\Exception\ValidationException;

class DeleteYearController extends AbstractDeleteController
{
    /**
     * {@inheritdoc}
     */
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        
        // 从URL路径中获取ID
        $path = $request->getUri()->getPath();
        preg_match('/\/api\/canbus\/years\/(\d+)/', $path, $matches);
        $yearId = $matches[1] ?? null;
        error_log('Path: ' . $path);
        error_log('Extracted year ID from path: ' . ($yearId ?? 'null'));
        
        // 如果从路径中获取失败，尝试从路由参数获取
        if (!$yearId) {
            $routeParams = $request->getAttribute('routeParameters', []);
            $yearId = $routeParams['id'] ?? null;
            error_log('Year ID from route parameters: ' . ($yearId ?? 'null'));
        }
        
        // 如果仍然没有ID，尝试从请求属性获取
        if (!$yearId) {
            $yearId = Arr::get($request->getAttributes(), 'id');
            error_log('Year ID from request attributes: ' . ($yearId ?? 'null'));
        }
        
        // 检查年份ID是否为空
        if (!$yearId) {
            error_log('DeleteYearController - Year ID is empty');
            throw new ValidationException([
                'id' => 'Year ID cannot be empty'
            ]);
        }
        
        // 查找年份
        $year = Year::find($yearId);
        
        if (!$year) {
            error_log('DeleteYearController - Year with ID ' . $yearId . ' not found');
            throw new ValidationException([
                'id' => 'Year with ID ' . $yearId . ' not found'
            ]);
        }
        
        error_log('DeleteYearController - Found year: ' . $year->id . ' - ' . $year->year_range);
        
        // 检查是否有配置依赖于此年份
        if ($year->configs()->count() > 0) {
            error_log('DeleteYearController - Deleting ' . $year->configs()->count() . ' related configs');
            // 如果有依赖，级联删除配置
            foreach ($year->configs as $config) {
                // 检查是否有链接依赖于此配置
                if ($config->links()->count() > 0) {
                    error_log('DeleteYearController - Deleting links for config ' . $config->id);
                    $config->links()->delete();
                }
            }
            $year->configs()->delete();
        }
        
        error_log('DeleteYearController - Deleting year with ID: ' . $year->id);
        $year->delete();
        error_log('DeleteYearController - Year deleted successfully');
    }
} 