import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1757888250998 implements MigrationInterface {
    name = 'Default1757888250998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_fd173efb9055780ae24035a5055"`);
        await queryRunner.query(`CREATE TYPE "public"."matches_result_enum" AS ENUM('success', 'failed')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wordId" uuid NOT NULL, "userId" uuid NOT NULL, "score" integer NOT NULL, "result" "public"."matches_result_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_1968454effd8fac520ccd0a33d" UNIQUE ("wordId"), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "statisticId"`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "matchId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gamePlayedId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attempts" ALTER COLUMN "userInput" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_0e1f5006d52bcbc4936d2f18ace" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_1968454effd8fac520ccd0a33dc" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_33707b2f73310f22cb6fd070d6b" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_33707b2f73310f22cb6fd070d6b"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_1968454effd8fac520ccd0a33dc"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_0e1f5006d52bcbc4936d2f18ace"`);
        await queryRunner.query(`ALTER TABLE "attempts" ALTER COLUMN "userInput" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gamePlayedId"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "matchId"`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD "statisticId" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_result_enum"`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_fd173efb9055780ae24035a5055" FOREIGN KEY ("statisticId") REFERENCES "statistics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
