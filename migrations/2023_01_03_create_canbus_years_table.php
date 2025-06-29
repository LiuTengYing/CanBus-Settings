<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('canbus_years')) {
            $schema->create('canbus_years', function (Blueprint $table) {
                $table->increments('id');
                $table->string('year_range');
                $table->unsignedInteger('model_id');
                $table->timestamps();
                
                $table->foreign('model_id')
                    ->references('id')
                    ->on('canbus_models')
                    ->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('canbus_years');
    }
]; 