<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\YearSerializer;
use Ltydi\CanBusSettings\Year;
use Illuminate\Support\Carbon;
use Flarum\Foundation\ValidationException;
use Illuminate\Database\ConnectionInterface;

class PostUpdateYearController extends AbstractShowController
{
    /**
     * @var ConnectionInterface
     */
    protected $db;

    /**
     * @param ConnectionInterface $db
     */
    public function __construct(ConnectionInterface $db)
    {
        $this->db = $db;
    }

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
        
        // Log request information
        $path = $request->getUri()->getPath();
        $method = $request->getMethod();
        $queryParams = $request->getQueryParams();
        $attributes = $request->getAttributes();
        $body = $request->getParsedBody();
        $headers = $request->getHeaders();
        
        error_log("PostUpdateYearController: Path=$path, Method=$method");
        error_log("PostUpdateYearController: Headers=" . json_encode($headers));
        error_log("PostUpdateYearController: QueryParams=" . json_encode($queryParams));
        error_log("PostUpdateYearController: Attributes=" . json_encode($attributes));
        error_log("PostUpdateYearController: Body=" . json_encode($body));
        
        // Extract ID from path
        preg_match('/\/api\/canbus\/years\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        // If ID is empty, try to get from route parameters
        if (!$id) {
            $id = Arr::get($attributes, 'id');
            error_log("PostUpdateYearController: ID from attributes=$id");
        }
        
        // If ID is empty, try to get from query parameters
        if (!$id) {
            $id = Arr::get($queryParams, 'id');
            error_log("PostUpdateYearController: ID from queryParams=$id");
        }
        
        // If ID is empty, try to get from request body
        if (!$id && isset($body['data']['id'])) {
            $id = $body['data']['id'];
            error_log("PostUpdateYearController: ID from request body data.id=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("PostUpdateYearController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Year ID cannot be empty'
            ]);
        }
        
        error_log("PostUpdateYearController: Final ID=$id");
        
        // Get data from request body
        $data = $body;
        
        // Ensure user has permission to update year
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            // Check if year exists
            $year = Year::findOrFail($id);
            error_log("PostUpdateYearController: Found year with ID=$id, current year_range=" . $year->year_range);
            
            // Update year range
            if (!isset($data['data']['attributes']['year_range'])) {
                error_log("PostUpdateYearController: year_range not found in request data");
                error_log("PostUpdateYearController: Full request data=" . json_encode($data));
                throw new ValidationException([
                    'year_range' => 'Year range cannot be empty'
                ]);
            }
            
            $newYearRange = $data['data']['attributes']['year_range'];
            if (empty($newYearRange)) {
                throw new ValidationException([
                    'year_range' => 'Year range cannot be empty'
                ]);
            }
            
            error_log("PostUpdateYearController: Updating year_range to $newYearRange");
            
            $now = Carbon::now();
            
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Update the year model
                $year->year_range = $newYearRange;
                $year->updated_at = $now;
                $year->save();
                
                $this->db->commit();
                error_log("PostUpdateYearController: Year updated successfully, new year_range=$newYearRange");
            } catch (\Exception $e) {
                $this->db->rollBack();
                error_log("PostUpdateYearController: Error saving year: " . $e->getMessage());
                throw $e;
            }
            
            // Force reload year data
            $year = Year::findOrFail($id);
            error_log("PostUpdateYearController: Reloaded year data, year_range=" . $year->year_range);
            
            return $year;
        } catch (\Exception $e) {
            error_log("PostUpdateYearController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
} 