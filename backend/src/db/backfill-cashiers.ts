import { and, asc, eq, isNull, like } from 'drizzle-orm';
import { closeDatabase, requireDb } from './client.js';
import { inventoryMovements, sales, users } from './schema/index.js';

/**
 * Assigns cashiers to demo sales that were created by the seeder.
 *
 * Only sales linked to an inventory movement whose reason starts with
 * `Seed sale #` are touched, so real transactions are never modified. Sales
 * that already have a cashier are left alone. At least one user account must
 * exist; run this after registering your administrator.
 */
async function backfill(): Promise<void> {
  const db = requireDb();

  const cashierUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.id))
    .limit(4);

  if (cashierUsers.length === 0) {
    throw new Error(
      'No user accounts exist. Register an administrator first, then run this script again.',
    );
  }

  const seededSales = await db
    .selectDistinct({ id: sales.id })
    .from(sales)
    .innerJoin(inventoryMovements, eq(inventoryMovements.saleId, sales.id))
    .where(
      and(
        eq(inventoryMovements.movementType, 'sale'),
        like(inventoryMovements.reason, 'Seed sale #%'),
        isNull(sales.processedBy),
      ),
    )
    .orderBy(asc(sales.id));

  if (seededSales.length === 0) {
    console.log('[backfill] No seeded sales need a cashier. Nothing changed.');
    return;
  }

  await db.transaction(async (tx) => {
    for (const [index, sale] of seededSales.entries()) {
      const cashier = cashierUsers[index % cashierUsers.length]!;

      await tx
        .update(sales)
        .set({ processedBy: cashier.id })
        .where(eq(sales.id, sale.id));

      await tx
        .update(inventoryMovements)
        .set({ userId: cashier.id })
        .where(
          and(
            eq(inventoryMovements.saleId, sale.id),
            like(inventoryMovements.reason, 'Seed sale #%'),
          ),
        );
    }

    // Seeded opening-stock movements were also written without a cashier.
    await tx
      .update(inventoryMovements)
      .set({ userId: cashierUsers[0]!.id })
      .where(
        and(
          isNull(inventoryMovements.userId),
          eq(inventoryMovements.reason, 'Seed opening stock'),
        ),
      );
  });

  console.log(
    `[backfill] Assigned cashiers to ${seededSales.length} seeded sale(s) using: ${cashierUsers
      .map((user) => user.name)
      .join(', ')}.`,
  );
}

void backfill()
  .catch((error: unknown) => {
    console.error(
      '[backfill] Failed:',
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
