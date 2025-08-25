import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1756133023193 implements MigrationInterface {
    name = 'Default1756133023193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" ADD "userInput" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "userInput"`);
    }

}
