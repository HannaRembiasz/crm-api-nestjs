#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/010e2a5008b2381436672d4f66332406c0c70524657fc8ae13fe2e0955fc3f05/contract';
import endContract from '../../snapshots/010e2a5008b2381436672d4f66332406c0c70524657fc8ae13fe2e0955fc3f05/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/046a2e7800958fbf246217ddbe7ae72e37dbe63bc3c89f0bf21a2c0601a029de/contract';
import startContract from '../../snapshots/046a2e7800958fbf246217ddbe7ae72e37dbe63bc3c89f0bf21a2c0601a029de/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('isProtected', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
