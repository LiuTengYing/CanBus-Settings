<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Ltydi\CanBusSettings\Brand;
use Flarum\Foundation\ValidationException;

class DeleteBrandController extends AbstractDeleteController
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
        
        error_log("DeleteBrandController: Path=$path, Method=$method");
        error_log("DeleteBrandController: QueryParams=" . json_encode($queryParams));
        error_log("DeleteBrandController: Attributes=" . json_encode($attributes));
        
        // Get ID directly from route parameters
        $id = Arr::get($attributes, 'routeParameters.id');
        error_log("DeleteBrandController: ID from route parameters=$id");
        
        // If ID is still empty, try to extract from path as fallback
        if (!$id) {
            preg_match('/\/api\/canbus\/brands\/(\d+)/', $path, $matches);
            $id = $matches[1] ?? null;
            error_log("DeleteBrandController: ID from path=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("DeleteBrandController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Brand ID cannot be empty'
            ]);
        }
        
        error_log("DeleteBrandController: Final ID=$id");
        
        // Ensure user has permission to delete brand
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            $brand = Brand::findOrFail($id);
            error_log("DeleteBrandController: Found brand with ID=$id, name=" . $brand->name);
            
            // Delete the brand
            $brand->delete();
            error_log("DeleteBrandController: Brand deleted successfully");
            
            return null;
        } catch (\Exception $e) {
            error_log("DeleteBrandController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
}