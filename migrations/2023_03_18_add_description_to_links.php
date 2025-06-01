<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('canbus_links') && !$schema->hasColumn('canbus_links', 'description')) {
            $schema->table('canbus_links', function (Blueprint $table) {
                $table->text('description')->nullable();
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasTable('canbus_links') && $schema->hasColumn('canbus_links', 'description')) {
            $schema->table('canbus_links', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
]; 