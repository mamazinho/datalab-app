import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../../test/test-utils';
import { TruncatedText } from './truncated-text';

const description = 'Cuida de anúncios e relatórios de campanha';

describe('<TruncatedText />', () => {
  it('keeps the full text on hover when clamping by lines', () => {
    renderWithProviders(<TruncatedText text={description} lines={3} />);

    expect(screen.getByText(description)).toHaveAttribute('title', description);
  });

  it('cuts by characters when a limit is given', () => {
    renderWithProviders(<TruncatedText text={description} maxChars={17} />);

    expect(screen.getByText('Cuida de anúncios…')).toHaveAttribute('title', description);
  });

  it('shows the fallback without a hover when there is no text', () => {
    renderWithProviders(<TruncatedText text="" />);

    expect(screen.getByText('—')).not.toHaveAttribute('title');
  });
});
