<?php

namespace Ltydi\CanBusSettings\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Ltydi\CanBusSettings\Api\Serializer\LinkSerializer;
use Ltydi\CanBusSettings\Link;
use Flarum\Foundation\ValidationException;

class UpdateLinkController extends AbstractShowController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = LinkSerializer::class;

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $id = Arr::get($request->getQueryParams(), 'id');
        error_log('Updating link with ID: ' . ($id ?? 'null'));
        
        if (empty($id)) {
            throw new ValidationException(['message' => 'Link ID cannot be empty']);
        }
        
        $data = $request->getParsedBody();
        error_log('Request body: ' . json_encode($data));
        
        $link = Link::find($id);
        if (!$link) {
            throw new ValidationException(['message' => 'Link not found']);
        }
        
        $attributes = Arr::get($data, 'data.attributes', []);
        error_log('Attributes: ' . json_encode($attributes));
        
        if (isset($attributes['url'])) {
            $link->url = $attributes['url'];
        }
        
        if (isset($attributes['description'])) {
            $link->description = $attributes['description'];
            error_log('Updating description to: ' . $attributes['description']);
        }
        
        $relationships = Arr::get($data, 'data.relationships', []);
        if (isset($relationships['config']['data']['id'])) {
            $link->config_id = $relationships['config']['data']['id'];
        }
        
        $link->save();
        
        return $link;
    }
} 