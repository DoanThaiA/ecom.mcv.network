import { Model, PaginateModel } from 'mongoose';
import { OrderDocumentRepository } from '../../../src/shop/order/model/order.repository';
import { OrderSchemaClass } from '../../../src/shop/order/model/order.schema';
import { OrderCounterDocument } from '../../../src/shop/order/model/order-counter.schema';

/**
 * Builds a repository whose only wired dependency is a counter model returning
 * the given sequence value. generateOrderNumber() never touches the order model,
 * so an empty stub is enough for it.
 */
const makeRepository = (seq: number) => {
  const findOneAndUpdate = jest.fn().mockResolvedValue({ seq });
  const counterModel = {
    findOneAndUpdate,
  } as unknown as Model<OrderCounterDocument>;
  const orderModel = {} as unknown as PaginateModel<OrderSchemaClass>;

  const repository = new OrderDocumentRepository(orderModel, counterModel);

  return { repository, findOneAndUpdate };
};

describe('OrderDocumentRepository.generateOrderNumber', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should key the daily counter by the Vietnam date, not UTC', async () => {
    // 2026-06-17T23:59:00Z === 2026-06-18 06:59 in Vietnam (UTC+7). The buggy
    // UTC logic produced ORD-20260617; the fix must produce ORD-20260618.
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-17T23:59:00Z'));

    const { repository, findOneAndUpdate } = makeRepository(1);

    const orderNumber = await repository.generateOrderNumber();

    expect(orderNumber).toBe('ORD-20260618-0001');
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'ORD-20260618' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
  });

  it('should still use the same Vietnam day just after 07:00 local', async () => {
    // 2026-06-18T00:03:00Z === 2026-06-18 07:03 in Vietnam.
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-18T00:03:00Z'));

    const { repository } = makeRepository(2);

    expect(await repository.generateOrderNumber()).toBe('ORD-20260618-0002');
  });

  it('should zero-pad the sequence to four digits', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-18T03:00:00Z'));

    const { repository } = makeRepository(42);

    expect(await repository.generateOrderNumber()).toBe('ORD-20260618-0042');
  });

  it('should roll the counter key to the next day at Vietnam midnight', async () => {
    // 2026-06-18T17:00:00Z === 2026-06-19 00:00 in Vietnam.
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-18T17:00:00Z'));

    const { repository, findOneAndUpdate } = makeRepository(1);

    await repository.generateOrderNumber();

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'ORD-20260619' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
  });
});
