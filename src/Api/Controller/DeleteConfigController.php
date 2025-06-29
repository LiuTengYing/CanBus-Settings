<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Ltydi\CanBusSettings\Config;
use Flarum\Foundation\ValidationException;

class DeleteConfigController extends AbstractDeleteController
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
        
        error_log("DeleteConfigController: Path=$path, Method=$method");
        error_log("DeleteConfigController: QueryParams=" . json_encode($queryParams));
        error_log("DeleteConfigController: Attributes=" . json_encode($attributes));
        
        // Get ID directly from route parameters
        $id = Arr::get($attributes, 'routeParameters.id');
        error_log("DeleteConfigController: ID from route parameters=$id");
        
        // If ID is still empty, try to extract from path as fallback
        if (!$id) {
            preg_match('/\/api\/canbus\/configs\/(\d+)/', $path, $matches);
            $id = $matches[1] ?? null;
            error_log("DeleteConfigController: ID from path=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("DeleteConfigController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Configuration ID cannot be empty'
            ]);
        }
        
        error_log("DeleteConfigController: Final ID=$id");
        
        // Ensure user has permission to delete config
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            $config = Config::findOrFail($id);
            error_log("DeleteConfigController: Found config with ID=$id, name=" . $config->name);
            
            // Delete the config
            $config->delete();
            error_log("DeleteConfigController: Config deleted successfully");
            
            return null;
        } catch (\Exception $e) {
            error_log("DeleteConfigController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
}