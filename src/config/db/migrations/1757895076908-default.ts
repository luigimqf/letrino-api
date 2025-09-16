import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1757895076908 implements MigrationInterface {
    name = 'Default1757895076908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "score" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "score" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."matches_result_enum" RENAME TO "matches_result_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_result_enum" AS ENUM('success', 'failed', 'in_progress')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "result" TYPE "public"."matches_result_enum" USING "result"::"text"::"public"."matches_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."matches_result_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."matches_result_enum_old" AS ENUM('success', 'failed')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "result" TYPE "public"."matches_result_enum_old" USING "result"::"text"::"public"."matches_result_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."matches_result_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_result_enum_old" RENAME TO "matches_result_enum"`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "score" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "score" SET NOT NULL`);
    }

}
