// One-off: OrderStatus was renamed to match the delivery tracker's 4 stages.
//   PENDING | PROCESSING -> PROCESSED   (order received, nothing shipped yet)
//   SHIPPED               -> SHIPPED    (unchanged)
//   DELIVERED             -> ARRIVED
//   CANCELLED             -> CANCELLED  (unchanged)
//
// Already run against the cluster in MONGO_DEV on 2026-07-30 (8 rows: 5 PENDING,
// 3 DELIVERED). Idempotent — re-running finds nothing left to change. Kept for
// any other environment still holding the old values.
//   usage: node -r dotenv/config scripts/2026-07-30-rename-order-status.js
require('dotenv').config();
const m = require('mongoose');

const URI = process.env.MONGO_DEV;
const MAP = { PENDING: 'PROCESSED', PROCESSING: 'PROCESSED', DELIVERED: 'ARRIVED' };

(async () => {
  await m.connect(URI);
  const orders = m.connection.collection('orders');

  const before = await orders.aggregate([{ $group: { _id: '$orderStatus', n: { $sum: 1 } } }]).toArray();
  console.log('BEFORE:', before);

  for (const [from, to] of Object.entries(MAP)) {
    const r = await orders.updateMany({ orderStatus: from }, { $set: { orderStatus: to } });
    if (r.matchedCount) console.log(`  ${from} -> ${to}: ${r.modifiedCount} row(s)`);
  }

  const after = await orders.aggregate([{ $group: { _id: '$orderStatus', n: { $sum: 1 } } }]).toArray();
  console.log('AFTER: ', after);

  const VALID = ['PROCESSED', 'SHIPPED', 'EN_ROUTE', 'ARRIVED', 'CANCELLED'];
  const stragglers = await orders.countDocuments({ orderStatus: { $nin: VALID } });
  console.log(stragglers === 0 ? 'OK: every order holds a valid status' : `PROBLEM: ${stragglers} invalid row(s)`);

  await m.disconnect();
})();
