# simap

A simple, fast CLI tool to generate sitemap.xml files from your directory structure.

## Installation

```bash
npm install -g simap
```

## Usage

```bash
simap <dirpath> <domain> [options]
```

### Arguments

- `dirpath` - Path to the directory containing your website files
- `domain` - Your website's base URL (must include http:// or https://)

### Options

- `--ignore, -i <route>` - Ignore routes starting with the specified path (can be used multiple times)
- `--help, -h` - Show help message

### Examples

```bash
# Generate sitemap for a local public directory
simap ./public https://example.com

# Ignore specific routes
simap ./public https://example.com --ignore /admin --ignore /private

# Using short flag
simap ./public https://example.com -i /blog/draft -i /test

# Multiple ignore patterns
simap ./public https://example.com -i /api -i /internal -i /temp

# Show help
simap --help
```

## Features

- 🚀 Fast and lightweight
- 📁 Recursively scans directories
- 🔍 Supports HTML files by default
- 📅 Includes last modification dates
- 🎯 SEO-friendly XML format
- ⚙️ Configurable via programmatic API
- 🚫 Automatically excludes common build/config folders
- 🎭 Ignore specific routes with `--ignore` flag

## Default Behavior

- **File extensions**: `.html`, `.htm`
- **Excluded folders**: `node_modules`, `.git`, `dist`, `.next`, `.nuxt`
- **Change frequency**: `weekly`
- **Priority**: `0.5`

## Output

The tool generates a `sitemap.xml` file in the specified directory with properly formatted URLs, including:
- URL location
- Last modification date
- Change frequency
- Priority

### Example Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>https://example.com/</loc>
		<lastmod>2024-01-20T10:30:00.000Z</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.5</priority>
	</url>
	<url>
		<loc>https://example.com/about</loc>
		<lastmod>2024-01-19T15:45:00.000Z</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.5</priority>
	</url>
</urlset>
```

## Programmatic Usage

You can also use simap as a module in your Node.js projects:

```typescript
import { generateSitemap } from 'simap';

await generateSitemap('./public', 'https://example.com', {
	extensions: ['.html', '.htm', '.php'],
	exclude: ['node_modules', 'temp'],
	priority: 0.8,
	changefreq: 'daily',
	ignoreRoutes: ['/admin', '/private', '/test']
});
```

### API Options

```typescript
interface SitemapOptions {
	extensions?: string[];        // File extensions to include
	exclude?: string[];           // Folders to exclude
	priority?: number;            // URL priority (0.0 to 1.0)
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	ignoreRoutes?: string[];      // Routes to ignore (prefix matching)
}
```

## Requirements

- Node.js >= 16.0.0

## License

MIT

## Contributing

Issues and pull requests are welcome!