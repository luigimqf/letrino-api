import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1758139819559 implements MigrationInterface {
    name = 'Default1758139819559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."matches_result_enum" RENAME TO "matches_result_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_result_enum" AS ENUM('correct', 'incorrect', 'in_progress')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "result" TYPE "public"."matches_result_enum" USING "result"::"text"::"public"."matches_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."matches_result_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."attempts_result_enum" RENAME TO "attempts_result_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."attempts_result_enum" AS ENUM('correct', 'incorrect')`);
        await queryRunner.query(`ALTER TABLE "attempts" ALTER COLUMN "result" TYPE "public"."attempts_result_enum" USING "result"::"text"::"public"."attempts_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attempts_result_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."attempts_result_enum_old" AS ENUM('played', 'correct', 'incorrect', 'skipped')`);
        await queryRunner.query(`ALTER TABLE "attempts" ALTER COLUMN "result" TYPE "public"."attempts_result_enum_old" USING "result"::"text"::"public"."attempts_result_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."attempts_result_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."attempts_result_enum_old" RENAME TO "attempts_result_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_result_enum_old" AS ENUM('success', 'failed', 'in_progress')`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "result" TYPE "public"."matches_result_enum_old" USING "result"::"text"::"public"."matches_result_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."matches_result_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."matches_result_enum_old" RENAME TO "matches_result_enum"`);
    }

}
