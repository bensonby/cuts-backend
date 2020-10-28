<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIndex extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('professors', function (Blueprint $table) {
            $table->unique('name');
        });
        Schema::table('courses', function (Blueprint $table) {
            $table->unique(['coursecode', 'year', 'term'], 'coursecode_unique');
        });
        Schema::table('periods', function (Blueprint $table) {
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('professors', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
        Schema::table('courses', function (Blueprint $table) {
            $table->dropUnique('coursecode_unique');
        });
        Schema::table('periods', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });
    }
}
