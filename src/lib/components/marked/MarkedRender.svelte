<script lang="ts">
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';

    let { content }: { content: string } = $props();

    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    let rawHTML = marked.parse(content);
    let sanitizedHTML = DOMPurify.sanitize(rawHTML as string);
    
</script>

{@html sanitizedHTML}