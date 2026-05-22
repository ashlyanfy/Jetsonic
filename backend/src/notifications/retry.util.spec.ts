import { withRetry } from './retry.util';

describe('withRetry', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, 3, 100);
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all attempts', async () => {
    const err = new Error('always fails');
    const fn = jest.fn().mockRejectedValue(err);

    const promise = withRetry(fn, 3, 100);
    // Attach rejection handler BEFORE advancing timers to avoid unhandled rejection warning
    const expectation = expect(promise).rejects.toThrow('always fails');
    await jest.runAllTimersAsync();
    await expectation;

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when maxAttempts is 1', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const promise = withRetry(fn, 1);
    await expect(promise).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
