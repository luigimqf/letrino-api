import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1756088577446 implements MigrationInterface {
    name = 'Default1756088577446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "used_words" DROP CONSTRAINT "FK_b51535246b58c33d0df705611a7"`);
        await queryRunner.query(`ALTER TABLE "used_words" ADD CONSTRAINT "FK_b51535246b58c33d0df705611a7" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "used_words" DROP CONSTRAINT "FK_b51535246b58c33d0df705611a7"`);
        await queryRunner.query(`ALTER TABLE "used_words" ADD CONSTRAINT "FK_b51535246b58c33d0df705611a7" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
