<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // 创建汽车品牌表
        if (!$schema->hasTable('canbus_brands')) {
            $schema->create('canbus_brands', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->timestamps();
            });
        }

        // 创建车型表
        if (!$schema->hasTable('canbus_models')) {
            $schema->create('canbus_models', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->unsignedInteger('brand_id');
                $table->timestamps();

                $table->foreign('brand_id')->references('id')->on('canbus_brands')->onDelete('cascade');
            });
        }

        // 创建年份表
        if (!$schema->hasTable('canbus_years')) {
            $schema->create('canbus_years', function (Blueprint $table) {
                $table->increments('id');
                $table->string('year_range');
                $table->unsignedInteger('model_id');
                $table->timestamps();

                $table->foreign('model_id')->references('id')->on('canbus_models')->onDelete('cascade');
            });
        }

        // 创建配置表
        if (!$schema->hasTable('canbus_configs')) {
            $schema->create('canbus_configs', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->unsignedInteger('year_id');
                $table->timestamps();

                $table->foreign('year_id')->references('id')->on('canbus_years')->onDelete('cascade');
            });
        }

        // 创建链接表
        if (!$schema->hasTable('canbus_links')) {
            $schema->create('canbus_links', function (Blueprint $table) {
                $table->increments('id');
                $table->text('url');
                $table->unsignedInteger('config_id');
                $table->timestamps();

                $table->foreign('config_id')->references('id')->on('canbus_configs')->onDelete('cascade');
            });
        }
    },

    'down' => function (Builder $schema) {
        // 删除表（按照依赖关系的相反顺序）
        $schema->dropIfExists('canbus_links');
        $schema->dropIfExists('canbus_configs');
        $schema->dropIfExists('canbus_years');
        $schema->dropIfExists('canbus_models');
        $schema->dropIfExists('canbus_brands');
    }
]; 