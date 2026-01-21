import * as fs from 'fs';
import * as path from 'path';

interface SitemapUrl {
	loc: string;
	lastmod: string;
	changefreq: string;
	priority: string;
}

interface SitemapResult {
	outputPath: string;
	urlCount: number;
	ignoredCount: number;
}

interface SitemapOptions {
	extensions?: string[];
	exclude?: string[];
	priority?: number;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	ignoreRoutes?: string[];
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(
	dirPath: string,
	basePath: string,
	extensions: string[],
	exclude: string[]
): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		const relativePath = path.relative(basePath, fullPath);

		// Check if path should be excluded
		if (exclude.some(pattern => relativePath.includes(pattern))) {
			continue;
		}

		if (entry.isDirectory()) {
			files.push(...scanDirectory(fullPath, basePath, extensions, exclude));
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name);
			if (extensions.length === 0 || extensions.includes(ext)) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

/**
 * Convert file path to URL path
 */
function filePathToUrl(filePath: string, basePath: string): string {
	let relativePath = path.relative(basePath, filePath);
	
	// Convert Windows paths to forward slashes
	relativePath = relativePath.replace(/\\/g, '/');
	
	// Remove file extensions for common web files
	relativePath = relativePath.replace(/\.(html|htm)$/i, '');
	
	// Handle index files
	relativePath = relativePath.replace(/\/index$/i, '/');
	relativePath = relativePath.replace(/^index$/i, '');
	
	// Ensure path starts with /
	if (relativePath && !relativePath.startsWith('/')) {
		relativePath = '/' + relativePath;
	}
	
	return relativePath || '/';
}

/**
 * Get file modification date in ISO format
 */
function getLastModified(filePath: string): string {
	const stats = fs.statSync(filePath);
	return stats.mtime.toISOString();
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
	const urlEntries = urls.map(url => {
		return `\t<url>
\t\t<loc>${escapeXml(url.loc)}</loc>
\t\t<lastmod>${url.lastmod}</lastmod>
\t\t<changefreq>${url.changefreq}</changefreq>
\t\t<priority>${url.priority}</priority>
\t</url>`;
	}).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Generate sitemap.xml from directory
 */
export async function generateSitemap(
	dirPath: string,
	domain: string,
	options: SitemapOptions = {}
): Promise<SitemapResult> {
	const {
		extensions = ['.html'],
		exclude = ['node_modules', '.git', 'dist', '.next', '.nuxt'],
		priority = 0.5,
		changefreq = 'weekly',
		ignoreRoutes = []
	} = options;

	// Remove trailing slash from domain
	const baseDomain = domain.replace(/\/$/, '');

	// Scan directory for files
	const files = scanDirectory(dirPath, dirPath, extensions, exclude);

	// Generate URLs
	const allUrls: SitemapUrl[] = files.map(filePath => {
		const urlPath = filePathToUrl(filePath, dirPath);
		const lastmod = getLastModified(filePath);

		return {
			loc: `${baseDomain}${urlPath}`,
			lastmod,
			changefreq,
			priority: priority.toString()
		};
	});

	// Filter out ignored routes
	const filteredUrls = allUrls.filter(url => {
		const urlPath = url.loc.replace(baseDomain, '');
		return !ignoreRoutes.some(ignorePath => urlPath.startsWith(ignorePath));
	});

	const ignoredCount = allUrls.length - filteredUrls.length;

	// Sort URLs alphabetically
	filteredUrls.sort((a, b) => a.loc.localeCompare(b.loc));

	// Generate XML
	const xml = generateSitemapXml(filteredUrls);

	// Write to file
	const outputPath = path.join(dirPath, 'sitemap.xml');
	fs.writeFileSync(outputPath, xml, 'utf-8');

	return {
		outputPath,
		urlCount: filteredUrls.length,
		ignoredCount
	};
}

export { SitemapOptions, SitemapResult, SitemapUrl };