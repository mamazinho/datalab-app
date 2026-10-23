import { describe, expect, it } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../../test/test-utils';
import { Avatar } from './avatar';

const PHOTO = 'https://lh3.googleusercontent.com/a/ana=s96-c';

const shownImage = () => decodeURIComponent(screen.getByRole('img', { name: 'Ana' }).getAttribute('src') ?? '');

describe('<Avatar />', () => {
  it('shows the photo without sending the referrer', () => {
    renderWithProviders(<Avatar src={PHOTO} name="Ana Souza" alt="Ana" />);

    expect(shownImage()).toBe(PHOTO);
    expect(screen.getByRole('img', { name: 'Ana' })).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('draws the initials of the first name when there is no photo', () => {
    renderWithProviders(<Avatar src={null} name="Ana Souza" alt="Ana" />);

    expect(shownImage()).toContain('>AN</text>');
  });

  it('draws only the first letter for the initial seed', () => {
    renderWithProviders(<Avatar name="Ana Souza" seed="initial" alt="Ana" />);

    expect(shownImage()).toContain('>A</text>');
  });

  it('falls back to the initials when the photo fails to load', () => {
    renderWithProviders(<Avatar src={PHOTO} name="Ana Souza" alt="Ana" />);

    fireEvent.error(screen.getByRole('img', { name: 'Ana' }));

    expect(shownImage()).toContain('>AN</text>');
  });

  it('keeps the image valid when the name starts with an emoji', () => {
    renderWithProviders(<Avatar name="🤖 Analista" seed="initial" alt="Ana" />);

    expect(shownImage()).toContain('>🤖</text>');
  });
});
