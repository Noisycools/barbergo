<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promosis', function (Blueprint $table) {
            $table->boolean('status')->default(true)->after('kode_promo');
            $table->integer('quota_limit')->unsigned()->nullable()->after('diskon');
            $table->dateTime('tanggal_mulai')->change();
            $table->dateTime('tanggal_berakhir')->change();
            $table->integer('diskon')->change();
        });

        Schema::table('reservasis', function (Blueprint $table) {
            $table->unsignedBigInteger('promosi_id')->nullable()->after('status');
            $table->foreign('promosi_id')->references('id')->on('promosis')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservasis', function (Blueprint $table) {
            $table->dropForeign(['promosi_id']);
            $table->dropColumn('promosi_id');
        });

        Schema::table('promosis', function (Blueprint $table) {
            $table->dropColumn(['status', 'quota_limit']);
            $table->date('tanggal_mulai')->change();
            $table->date('tanggal_berakhir')->change();
            $table->decimal('diskon', 8, 2)->change();
        });
    }
};
