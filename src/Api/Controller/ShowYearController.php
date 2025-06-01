<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\YearSerializer;
use Ltydi\CanBusSettings\Year;
use Illuminate\Database\ConnectionInterface;

class ShowYearController extends AbstractShowController
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
        
        error_log("ShowYearController: Path=$path, Method=$method");
        error_log("ShowYearController: QueryParams=" . json_encode($queryParams));
        error_log("ShowYearController: Attributes=" . json_encode($attributes));
        
        // Extract ID from path
        preg_match('/\/api\/canbus\/debug\/year\/(\d+)/', $path, $matches);
        $id = $matches[1] ?? null;
        
        // If ID is empty, try to get from route parameters
        if (!$id) {
            $id = Arr::get($attributes, 'id');
            error_log("ShowYearController: ID from attributes=$id");
        }
        
        // If ID is still empty, throw exception
        if (!$id) {
            error_log("ShowYearController: ID is empty");
            throw new \Exception('Year ID cannot be empty');
        }
        
        error_log("ShowYearController: Final ID=$id");
        
        // Get year from database
        $year = Year::findOrFail($id);
        error_log("ShowYearController: Found year with ID=$id, year_range=" . $year->year_range);
        
        return $year;
    }
} 