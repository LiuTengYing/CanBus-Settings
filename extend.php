<?php

/*
 * This file is part of Ltydi/canbus-settings.
 *
 * Copyright (c) 2023 Ltydi.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Ltydi\CanBusSettings;

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;
use Ltydi\CanBusSettings\Api\Controller;
use Flarum\Http\Request\ServerRequestInterface;
use Flarum\Http\Response\JsonResponse;

return [
    // 注册前端资源
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/canbus', 'canbus'),

    // 注册后台资源
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    // 注册设置
    new Extend\Locales(__DIR__.'/locale'),
    
    // 添加设置选项
    // 在现有的 Settings 配置中添加
    (new Extend\Settings())
        ->serializeToForum('canbus.promptText', 'ltydi-canbus-settings.promptText')
        ->serializeToForum('canbus.displayName', 'ltydi-canbus-settings.displayName'),
    
    // 添加设置事件监听器
    (new Extend\Event())
        ->listen(\Flarum\Settings\Event\Saved::class, \Ltydi\CanBusSettings\Listeners\SaveSettings::class),
    
    // 注册API路由
    (new Extend\Routes('api'))
        ->get('/canbus/brands', 'canbus.brands.index', Controller\ListBrandsController::class)
        ->post('/canbus/brands', 'canbus.brands.create', Controller\CreateBrandController::class)
        ->patch('/canbus/brands/{id}', 'canbus.brands.update', Controller\UpdateBrandController::class)
        ->delete('/canbus/brands/{id}', 'canbus.brands.delete', Controller\DeleteBrandController::class)
        
        ->get('/canbus/models', 'canbus.models.index', Controller\ListModelsController::class)
        ->post('/canbus/models', 'canbus.models.create', Controller\CreateModelController::class)
        ->patch('/canbus/models/{id}', 'canbus.models.update', Controller\UpdateModelController::class)
        ->delete('/canbus/models/{id}', 'canbus.models.delete', Controller\DeleteModelController::class)
        
        ->get('/canbus/years', 'canbus.years.index', Controller\ListYearsController::class)
        ->post('/canbus/years', 'canbus.years.create', Controller\CreateYearController::class)
        ->patch('/canbus/years/{id}', 'canbus.years.update', Controller\UpdateYearController::class)
        ->post('/canbus/years/{id}', 'canbus.years.post-update', Controller\PostUpdateYearController::class)
        ->delete('/canbus/years/{id}', 'canbus.years.delete', Controller\DeleteYearController::class)
        ->patch('/canbus/direct-update-year/{id}', 'canbus.years.direct-update', Controller\DirectUpdateYearController::class)
        ->get('/canbus/debug/year/{id}', 'canbus.years.debug', Controller\ShowYearController::class)
        
        ->get('/canbus/configs', 'canbus.configs.index', Controller\ListConfigsController::class)
        ->post('/canbus/configs', 'canbus.configs.create', Controller\CreateConfigController::class)
        ->patch('/canbus/configs/{id}', 'canbus.configs.update', Controller\UpdateConfigController::class)
        ->delete('/canbus/configs/{id}', 'canbus.configs.delete', Controller\DeleteConfigController::class)
        
        ->get('/canbus/links', 'canbus.links.index', Controller\ListLinksController::class)
        ->post('/canbus/links', 'canbus.links.create', Controller\CreateLinkController::class)
        ->patch('/canbus/links/{id}', 'canbus.links.update', Controller\UpdateLinkController::class)
        ->delete('/canbus/links/{id}', 'canbus.links.delete', Controller\DeleteLinkController::class),
        
    // 允许所有用户访问 CanBus API
    (new Extend\ApiController(Controller\ListBrandsController::class))
        ->addInclude(['models']),
        
    (new Extend\ApiController(Controller\ListModelsController::class))
        ->addInclude(['brand', 'years']),
        
    (new Extend\ApiController(Controller\ListYearsController::class))
        ->addInclude(['model', 'configs']),
        
    (new Extend\ApiController(Controller\ListConfigsController::class))
        ->addInclude(['year', 'link']),
        
    (new Extend\ApiController(Controller\ListLinksController::class))
        ->addInclude(['config']),

    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(function (ForumSerializer $serializer) {
            return [
                'canBusSettingsPath' => '/admin/canbus-settings',
            ];
        }),
];