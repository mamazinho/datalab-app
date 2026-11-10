import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from './markdown';

describe('Markdown', () => {
    it('renders a markdown table', () => {
        render(<Markdown>{'| Canal | Sessões |\n| --- | --- |\n| Orgânico | 120 |'}</Markdown>);

        expect(screen.getByRole('columnheader', { name: 'Sessões' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '120' })).toBeInTheDocument();
    });
});
