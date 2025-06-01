<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Ltydi\CanBusSettings\Link;
use Flarum\Foundation\ValidationException;

class DeleteLinkController extends AbstractDeleteController
{
    /**
     * {@inheritdoc}
     */
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        
        // Log request information
        $path = $request->getUri()->getPath();
        $method = $request->getMethod();
        $queryParams = $request->getQueryParams();
        $attributes = $request->getAttributes();
        
        error_log("DeleteLinkController: Path=$path, Method=$method");
        error_log("DeleteLinkController: QueryParams=" . json_encode($queryParams));
        error_log("DeleteLinkController: Attributes=" . json_encode($attributes));
        
        // Get ID directly from route parameters
        $linkId = Arr::get($attributes, 'routeParameters.id');
        error_log("DeleteLinkController: ID from route parameters=$linkId");
        
        // If ID is still empty, try to extract from path as fallback
        if (!$linkId) {
            preg_match('/\/api\/canbus\/links\/(\d+)/', $path, $matches);
            $linkId = $matches[1] ?? null;
            error_log("DeleteLinkController: ID from path=$linkId");
        }
        
        // 检查链接ID是否为空
        if (empty($linkId)) {
            error_log('DeleteLinkController - Link ID is empty');
            throw new ValidationException([
                'id' => 'Link ID cannot be empty'
            ]);
        }
        
        // 查找链接
        $link = Link::find($linkId);
        
        if (!$link) {
            error_log('DeleteLinkController - Link with ID ' . $linkId . ' not found');
            throw new ValidationException([
                'id' => 'The specified link does not exist.'
            ]);
        }
        
        // 删除链接
        $link->delete();
        
        error_log('DeleteLinkController - Deleted link with ID ' . $linkId);
    }
}