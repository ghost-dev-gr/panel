<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('server_proxy', function (Blueprint $table) {
            $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
            $table->foreign('allocation_id')->references('id')->on('allocations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('server_proxy', function (Blueprint $table) {
            $table->dropForeign(['server_id']);
            $table->dropForeign(['allocation_id']);
        });
    }
};
