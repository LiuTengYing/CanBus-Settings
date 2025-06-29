<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('canbus_models')) {
            $schema->create('canbus_models', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->unsignedInteger('brand_id');
                $table->timestamps();
                
                $table->foreign('brand_id')
                    ->references('id')
                    ->on('canbus_brands')
                    ->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('canbus_models');
    }
]; 