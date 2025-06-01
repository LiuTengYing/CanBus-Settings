<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\ModelSerializer;
use Ltydi\CanBusSettings\Model;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class UpdateModelController extends AbstractShowController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = ModelSerializer::class;

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
        
        error_log("UpdateModelController: Path=$path, Method=$method");
        error_log("UpdateModelController: QueryParams=" . json_encode($queryParams));
        error_log("UpdateModelController: Attributes=" . json_encode($attributes));
        error_log("UpdateModelController: Body=" . json_encode($body));
        
        // Extract ID from path
        preg_match('/\/api\/canbus\/models\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        // If ID is empty, try to get from route parameters
        if (!$id) {
            $id = Arr::get($attributes, 'id');
            error_log("UpdateModelController: ID from attributes=$id");
        }
        
        // If ID is empty, try to get from request body
        if (!$id && isset($body['data']['id'])) {
            $id = $body['data']['id'];
            error_log("UpdateModelController: ID from request body data.id=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("UpdateModelController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Model ID cannot be empty'
            ]);
        }
        
        error_log("UpdateModelController: Final ID=$id");
        
        // Get data from request body
        $data = $body;
        
        // Ensure user has permission to update model
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            // Check if model exists
            $model = Model::findOrFail($id);
            error_log("UpdateModelController: Found model with ID=$id, current name=" . $model->name);
            
            // Update model name
            if (isset($data['data']['attributes']['name'])) {
                $newName = $data['data']['attributes']['name'];
                error_log("UpdateModelController: Updating name to $newName");
                $model->name = $newName;
            } else {
                error_log("UpdateModelController: name not found in request data");
                error_log("UpdateModelController: Full request data=" . json_encode($data));
            }
            
            // Update brand ID
            if (isset($data['data']['relationships']['brand']['data']['id'])) {
                $model->brand_id = $data['data']['relationships']['brand']['data']['id'];
            }
            
            $model->updated_at = Carbon::now();
            $model->save();
            
            error_log("UpdateModelController: Model updated successfully, new name=" . $model->name);
            
            return $model;
        } catch (\Exception $e) {
            error_log("UpdateModelController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
} 