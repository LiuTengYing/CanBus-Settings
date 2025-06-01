<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('canbus_configs')) {
            $schema->create('canbus_configs', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->unsignedInteger('year_id');
                $table->timestamps();
                
                $table->foreign('year_id')
                    ->references('id')
                    ->on('canbus_years')
                    ->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('canbus_configs');
    }
]; 