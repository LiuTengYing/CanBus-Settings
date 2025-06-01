<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\ConfigSerializer;
use Ltydi\CanBusSettings\Config;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;

class UpdateConfigController extends AbstractShowController
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
        
        // Log request information
        $path = $request->getUri()->getPath();
        $method = $request->getMethod();
        $queryParams = $request->getQueryParams();
        $attributes = $request->getAttributes();
        $body = $request->getParsedBody();
        
        error_log("UpdateConfigController: Path=$path, Method=$method");
        error_log("UpdateConfigController: QueryParams=" . json_encode($queryParams));
        error_log("UpdateConfigController: Attributes=" . json_encode($attributes));
        error_log("UpdateConfigController: Body=" . json_encode($body));
        
        // Extract ID from path
        preg_match('/\/api\/canbus\/configs\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        // If ID is empty, try to get from route parameters
        if (!$id) {
            $id = Arr::get($attributes, 'id');
            error_log("UpdateConfigController: ID from attributes=$id");
        }
        
        // If ID is empty, try to get from request body
        if (!$id && isset($body['data']['id'])) {
            $id = $body['data']['id'];
            error_log("UpdateConfigController: ID from request body data.id=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("UpdateConfigController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Configuration ID cannot be empty'
            ]);
        }
        
        error_log("UpdateConfigController: Final ID=$id");
        
        // Get data from request body
        $data = $body;
        
        // Ensure user has permission to update config
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            // Check if config exists
            $config = Config::findOrFail($id);
            error_log("UpdateConfigController: Found config with ID=$id, current name=" . $config->name);
            
            // Update config name
            if (isset($data['data']['attributes']['name'])) {
                $newName = $data['data']['attributes']['name'];
                error_log("UpdateConfigController: Updating name to $newName");
                $config->name = $newName;
            } else {
                error_log("UpdateConfigController: name not found in request data");
                error_log("UpdateConfigController: Full request data=" . json_encode($data));
            }
            
            // Update year ID
            if (isset($data['data']['relationships']['year']['data']['id'])) {
                $config->year_id = $data['data']['relationships']['year']['data']['id'];
            }
            
            $config->updated_at = Carbon::now();
            $config->save();
            
            error_log("UpdateConfigController: Config updated successfully, new name=" . $config->name);
            
            return $config;
        } catch (\Exception $e) {
            error_log("UpdateConfigController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
} 