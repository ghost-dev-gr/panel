<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProxyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('server_proxy', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('server_id');
            $table->string('domain');
            $table->unsignedInteger('allocation_id');
            $table->boolean('ssl_enabled')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('server_proxy');
    }
}
