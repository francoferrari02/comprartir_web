import { QueryRunner } from 'typeorm';
import { List } from '../entities/list';
import { User } from '../entities/user';

/**
 * Generates a unique list name by appending a numeric suffix when needed.
 */
export async function generateUniqueListName(baseName: string, owner: User, queryRunner: QueryRunner): Promise<string> {
  let uniqueName = baseName;
  let counter = 1;

  while (true) {
    const existingList = await queryRunner.manager.findOne(List, {
      where: {
        name: uniqueName,
        owner: { id: owner.id }
      },
      withDeleted: true
    });

    if (!existingList) {
      return uniqueName;
    }

    uniqueName = `${baseName} (${counter})`;
    counter++;
  }
}
