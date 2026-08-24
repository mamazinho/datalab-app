import { afterEach, describe, expect, it, vi } from 'vitest';
import { SOCIAL_AUTH_CHANNEL, SOCIAL_LOGIN_SUCCESS, type AuthChannelEvent } from '../types/auth';
import { closeCallbackWindow, postAuthChannelMessage } from './auth-channel';

const loginEvent: AuthChannelEvent = {
  type: SOCIAL_LOGIN_SUCCESS,
  provider: 'google',
  response: { access_token: 'token', token_type: 'bearer', expires_in: 3600, scope: '' },
};

afterEach(() => {
  vi.useRealTimers();
});

describe('postAuthChannelMessage', () => {
  it('delivers the callback result to whoever is listening', async () => {
    const listener = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
    const received = new Promise<AuthChannelEvent>((resolve) => {
      listener.onmessage = (event) => resolve(event.data as AuthChannelEvent);
    });

    postAuthChannelMessage(loginEvent);

    expect(await received).toEqual(loginEvent);
    listener.close();
  });
});

describe('closeCallbackWindow', () => {
  it('closes the window after the delay', () => {
    vi.useFakeTimers();
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    const fallback = vi.fn();

    closeCallbackWindow(fallback);
    expect(close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(close).toHaveBeenCalledOnce();
  });

  it('runs the fallback when the window refuses to close', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});
    const fallback = vi.fn();

    closeCallbackWindow(fallback);
    vi.advanceTimersByTime(500);

    expect(fallback).toHaveBeenCalledOnce();
  });

  it('cancels the close when the caller unmounts first', () => {
    vi.useFakeTimers();
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});
    const fallback = vi.fn();

    const cancel = closeCallbackWindow(fallback);
    cancel();
    vi.advanceTimersByTime(500);

    expect(close).not.toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();
  });

  it('honours a custom delay', () => {
    vi.useFakeTimers();
    const close = vi.spyOn(window, 'close').mockImplementation(() => {});

    closeCallbackWindow(vi.fn(), 2000);
    vi.advanceTimersByTime(500);
    expect(close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);
    expect(close).toHaveBeenCalledOnce();
  });
});
