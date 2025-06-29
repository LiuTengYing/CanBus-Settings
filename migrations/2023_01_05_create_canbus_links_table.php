<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('canbus_links')) {
            $schema->create('canbus_links', function (Blueprint $table) {
                $table->increments('id');
                $table->string('url');
                $table->unsignedInteger('config_id');
                $table->timestamps();
                
                $table->foreign('config_id')
                    ->references('id')
                    ->on('canbus_configs')
                    ->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('canbus_links');
    }
]; 