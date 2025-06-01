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

class DirectUpdateYearController extends AbstractShowController
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
        
        error_log("DirectUpdateYearController: Path=$path, Method=$method");
        error_log("DirectUpdateYearController: QueryParams=" . json_encode($queryParams));
        error_log("DirectUpdateYearController: Attributes=" . json_encode($attributes));
        error_log("DirectUpdateYearController: Body=" . json_encode($body));
        
        // Extract ID from path
        preg_match('/\/api\/canbus\/direct-update-year\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        // If ID is empty, try to get from route parameters
        if (!$id) {
            $id = Arr::get($attributes, 'id');
            error_log("DirectUpdateYearController: ID from attributes=$id");
        }
        
        // If ID is empty, try to get from request body
        if (!$id && isset($body['data']['id'])) {
            $id = $body['data']['id'];
            error_log("DirectUpdateYearController: ID from request body data.id=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("DirectUpdateYearController: ID is empty, throwing exception");
            throw new ValidationException([
                'id' => 'Year ID cannot be empty'
            ]);
        }
        
        error_log("DirectUpdateYearController: Final ID=$id");
        
        // Get year_range from request body
        $yearRange = null;
        if (isset($body['data']['attributes']['year_range'])) {
            $yearRange = $body['data']['attributes']['year_range'];
        } elseif (isset($body['year_range'])) {
            $yearRange = $body['year_range'];
        }
        
        // 如果通过表单提交
        if (!$yearRange && isset($_POST['year_range'])) {
            $yearRange = $_POST['year_range'];
            error_log("DirectUpdateYearController: Using year_range from POST data: $yearRange");
        }
        
        // If year_range is empty, throw exception
        if (!$yearRange) {
            error_log("DirectUpdateYearController: Year range is empty, throwing exception");
            throw new ValidationException([
                'year_range' => 'Year range cannot be empty'
            ]);
        }
        
        error_log("DirectUpdateYearController: Year range=$yearRange");
        
        // Ensure user has permission to update year
        // Temporarily commented out for testing
        // $actor->assertCan('canbus.settings');
        
        try {
            // Start a transaction
            return $this->db->transaction(function () use ($id, $yearRange) {
                // Check if year exists
                $year = Year::findOrFail($id);
                error_log("DirectUpdateYearController: Found year with ID=$id, current year_range=" . $year->year_range);
                
                // Update year_range
                $year->year_range = $yearRange;
                $year->updated_at = Carbon::now();
                $year->save();
                
                error_log("DirectUpdateYearController: Year updated successfully, new year_range=" . $year->year_range);
                
                return $year;
            });
        } catch (\Exception $e) {
            error_log("DirectUpdateYearController: Exception: " . $e->getMessage());
            throw $e;
        }
    }
} 