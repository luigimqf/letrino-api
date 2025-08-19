import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1755635307531 implements MigrationInterface {
    name = 'Default1755635307531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" DROP CONSTRAINT "FK_8d36ee4057c23c71806b27fd1d8"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP CONSTRAINT "FK_21e98c616833548fb68376b4e2f"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP CONSTRAINT "FK_938c03b654d3186f157b43873e4"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "attempt"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."attempts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "wordId"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "attempt"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."statistics_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "statisticId" uuid NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."attempts_result_enum" AS ENUM('played', 'correct', 'incorrect', 'skipped')`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "result" "public"."attempts_result_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "gamesPlayed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "gamesWon" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "gamesLost" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "winStreak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "bestWinStreak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "score" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordHash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "words" DROP CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d"`);
        await queryRunner.query(`ALTER TABLE "words" DROP COLUMN "word"`);
        await queryRunner.query(`ALTER TABLE "words" ADD "word" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "words" ADD CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d" UNIQUE ("word")`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP CONSTRAINT "FK_c9989a8e8506743633ba5e0aed0"`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD CONSTRAINT "UQ_c9989a8e8506743633ba5e0aed0" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP COLUMN "wordId"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD "wordId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_fd173efb9055780ae24035a5055" FOREIGN KEY ("statisticId") REFERENCES "statistics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD CONSTRAINT "FK_c9989a8e8506743633ba5e0aed0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" DROP CONSTRAINT "FK_c9989a8e8506743633ba5e0aed0"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_fd173efb9055780ae24035a5055"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" DROP COLUMN "wordId"`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD "wordId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP CONSTRAINT "UQ_c9989a8e8506743633ba5e0aed0"`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD CONSTRAINT "FK_c9989a8e8506743633ba5e0aed0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "words" DROP CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d"`);
        await queryRunner.query(`ALTER TABLE "words" DROP COLUMN "word"`);
        await queryRunner.query(`ALTER TABLE "words" ADD "word" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "words" ADD CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d" UNIQUE ("word")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordHash"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "bestWinStreak"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "winStreak"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "gamesLost"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "gamesWon"`);
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "gamesPlayed"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "result"`);
        await queryRunner.query(`DROP TYPE "public"."attempts_result_enum"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "statisticId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "score" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."statistics_type_enum" AS ENUM('played', 'correct', 'incorrect', 'skipped')`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "type" "public"."statistics_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "attempt" character varying`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD "wordId" uuid NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."attempts_type_enum" AS ENUM('played', 'correct', 'incorrect', 'skipped')`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "type" "public"."attempts_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "attempt" character varying`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD CONSTRAINT "FK_938c03b654d3186f157b43873e4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skipped_attempts" ADD CONSTRAINT "FK_21e98c616833548fb68376b4e2f" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "statistics" ADD CONSTRAINT "FK_8d36ee4057c23c71806b27fd1d8" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
