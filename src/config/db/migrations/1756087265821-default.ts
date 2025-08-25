import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1756087265821 implements MigrationInterface {
    name = 'Default1756087265821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "used_words" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "used_words" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "used_words" ADD CONSTRAINT "FK_5a2c2b949d5f45355c68c2db735" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "used_words" DROP CONSTRAINT "FK_5a2c2b949d5f45355c68c2db735"`);
        await queryRunner.query(`ALTER TABLE "used_words" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "used_words" ADD "userId" character varying NOT NULL`);
    }

}
