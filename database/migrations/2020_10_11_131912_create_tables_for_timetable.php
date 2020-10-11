<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTablesForTimetable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->integer('year');
            $table->integer('term');
            $table->integer('unit');
            $table->float('score', 8, 2);
            $table->timestamps();
        });
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->integer('term');
            $table->string('coursecode');
            $table->string('coursegroup');
            $table->integer('unit');
            $table->string('coursename');
            $table->string('coursenamec');
            $table->integer('quota');
            $table->timestamps();
        });
        Schema::create('professors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
        Schema::create('course_professor', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')->onDelete('cascade');

            $table->unsignedBigInteger('professor_id');
            $table->foreign('professor_id')
                  ->references('id')
                  ->on('professors')->onDelete('cascade');

            $table->timestamps();
        });
        Schema::create('periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained();
            $table->string('day');
            $table->integer('start');
            $table->integer('end');
            $table->string('venue');
            $table->string('type');
            $table->string('lang');
            $table->integer('quota');
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
        Schema::create('user_courses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->foreign('course_id')
                  ->references('id')
                  ->on('courses')->onDelete('cascade');

            $table->unsignedBigInteger('timetable_id');
            $table->foreign('timetable_id')
                  ->references('id')
                  ->on('timetables')->onDelete('cascade');

            $table->string('comment')->nullable();
            $table->string('color');
            $table->timestamps();
        });
        Schema::create('user_periods', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_course_id');
            $table->foreign('user_course_id')
                  ->references('id')
                  ->on('user_courses')->onDelete('cascade');

            $table->unsignedBigInteger('period_id');
            $table->foreign('period_id')
                  ->references('id')
                  ->on('periods')->onDelete('cascade');

            $table->boolean('necessity');
            $table->timestamps();
        });
        Schema::create('custom_periods', function (Blueprint $table) {
            $table->id();
            $table->string('day');
            $table->integer('start');
            $table->integer('end');
            $table->string('venue');
            $table->unsignedBigInteger('user_period_id');
            $table->foreign('user_period_id')
                  ->references('id')
                  ->on('user_periods')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('timetables');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('professors');
        Schema::dropIfExists('course_professor');
        Schema::dropIfExists('periods');
        Schema::dropIfExists('user_courses');
        Schema::dropIfExists('custom_periods');
        Schema::dropIfExists('user_periods');
    }
}
