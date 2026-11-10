import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const REMARK_PLUGINS = [remarkGfm];

export const Markdown = ({ children }: { children: string }) => (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{children}</ReactMarkdown>
);
