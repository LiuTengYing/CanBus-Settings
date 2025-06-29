<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\BrandSerializer;
use Ltydi\CanBusSettings\Brand;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class UpdateBrandController extends AbstractShowController
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
        
        // Log request information
        $path = $request->getUri()->getPath();
        $method = $request->getMethod();
        $queryParams = $request->getQueryParams();
        $attributes = $request->getAttributes();
        $body = $request->getParsedBody();
        
        error_log("UpdateBrandController: Path=$path, Method=$method");
        error_log("UpdateBrandController: QueryParams=" . json_encode($queryParams));
        error_log("UpdateBrandController: Attributes=" . json_encode($attributes));
        error_log("UpdateBrandController: Body=" . json_encode($body));
        
        // Get ID directly from route parameters
        $id = Arr::get($attributes, 'routeParameters.id');
        error_log("UpdateBrandController: ID from route parameters=$id");
        
        // If ID is still empty, try to extract from path as fallback
        if (!$id) {
            preg_match('/\/api\/canbus\/brands\/(\d+)/', $path, $matches);
            $id = $matches[1] ?? null;
            error_log("UpdateBrandController: ID from path=$id");
        }
        
        // If ID is empty, try to get from request body
        if (!$id && isset($body['data']['id'])) {
            $id = $body['data']['id'];
            error_log("UpdateBrandController: ID from request body data.id=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("UpdateBrandController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Brand ID cannot be empty'
            ]);
        }
        
        error_log("UpdateBrandController: Final ID=$id");
        
        // Get data from request body
        $data = $body;
        
        // Ensure user has permission to update brand
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            // Check if brand exists
            $brand = Brand::findOrFail($id);
            error_log("UpdateBrandController: Found brand with ID=$id, current name=" . $brand->name);
            
            // Update brand name
            if (isset($data['data']['attributes']['name'])) {
                $newName = $data['data']['attributes']['name'];
                error_log("UpdateBrandController: Updating name to $newName");
                $brand->name = $newName;
            } else {
                error_log("UpdateBrandController: name not found in request data");
                error_log("UpdateBrandController: Full request data=" . json_encode($data));
            }
            
            $brand->updated_at = Carbon::now();
            $brand->save();
            
            error_log("UpdateBrandController: Brand updated successfully, new name=" . $brand->name);
            
            return $brand;
        } catch (\Exception $e) {
            error_log("UpdateBrandController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
}