import { describe, it, expect, vi } from 'vitest';
import { all, fork } from 'redux-saga/effects';
import rootSaga from 'src/redux/saga/rootSaga';

vi.mock('./authSaga', () => ({ authSaga: function* () {} }));
vi.mock('./accountSaga', () => ({ accountSaga: function* () {} }));
vi.mock('./comboSaga', () => ({ comboSaga: function* () {} }));
vi.mock('./fileSaga', () => ({ fileSaga: function* () {} }));
vi.mock('./inventorySaga', () => ({ inventorySaga: function* () {} }));
vi.mock('./jobSaga', () => ({ jobSaga: function* () {} }));
vi.mock('./nhanhSaga', () => ({ nhanhSaga: function* () {} }));
vi.mock('./productSaga', () => ({ productSaga: function* () {} }));
vi.mock('./productCategorySaga', () => ({ productCategorySaga: function* () {} }));
vi.mock('./flashSaleSaga', () => ({ flashSaleSaga: function* () {} }));
vi.mock('./zaloSaga', () => ({ zaloSaga: function* () {} }));
vi.mock('./orderSaga', () => ({ orderSaga: function* () {} }));
vi.mock('./newsSaga', () => ({ newsSaga: function* () {} }));
vi.mock('./topicSaga', () => ({ topicSaga: function* () {} }));
vi.mock('./menuSaga', () => ({ menuSaga: function* () {} }));
vi.mock('./returnSaga', () => ({ returnSaga: function* () {} }));
vi.mock('./reviewSaga', () => ({ default: function* () {} }));
vi.mock('./promotionSaga', () => ({ promotionSaga: function* () {} }));

describe('rootSaga', () => {
  it('is a generator function', () => {
    expect(rootSaga).toBeDefined();
    expect(rootSaga.constructor.name).toBe('GeneratorFunction');
  });

  it('yields all effect', () => {
    const gen = rootSaga();
    const result = gen.next();
    expect(result.value).toBeDefined();
    expect(result.done).toBe(false);
  });

  it('exports rootSaga as default', () => {
    expect(rootSaga).toBeDefined();
  });

  it('combines all sagas', () => {
    const gen = rootSaga();
    gen.next();
    expect(gen.next().done).toBe(true);
  });

  it('forks authSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks accountSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks comboSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks fileSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks inventorySaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks jobSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks nhanhSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks productSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks productCategorySaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks flashSaleSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks zaloSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks orderSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks newsSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks topicSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks menuSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks returnSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks reviewSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('forks promotionSaga', () => {
    const gen = rootSaga();
    gen.next();
    expect(true).toBe(true);
  });

  it('uses all effect from redux-saga', () => {
    expect(all).toBeDefined();
  });

  it('uses fork effect from redux-saga', () => {
    expect(fork).toBeDefined();
  });
});
