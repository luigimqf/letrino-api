import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1757888781235 implements MigrationInterface {
    name = 'Default1757888781235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gamePlayedId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "gamePlayedId" character varying NOT NULL`);
    }

}
