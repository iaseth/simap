#!/usr/bin/env node

import { generateSitemap } from './index';
import * as path from 'path';
import * as fs from 'fs';

function showHelp(): void {
	console.log(`
simap - Sitemap Generator

Usage:
  simap <dirpath> <domain>

Arguments:
  dirpath    Directory path to scan for files
  domain     Base domain URL (e.g., https://example.com)

Options:
  --help, -h    Show this help message

Examples:
  simap ./public https://example.com
  simap /var/www/html https://mysite.com
	`);
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		showHelp();
		process.exit(0);
	}

	if (args.length < 2) {
		console.error('Error: Missing required arguments\n');
		showHelp();
		process.exit(1);
	}

	const [dirPath, domain] = args;

	// Validate directory exists
	const absolutePath = path.resolve(dirPath);
	if (!fs.existsSync(absolutePath)) {
		console.error(`Error: Directory not found: ${absolutePath}`);
		process.exit(1);
	}

	if (!fs.statSync(absolutePath).isDirectory()) {
		console.error(`Error: Path is not a directory: ${absolutePath}`);
		process.exit(1);
	}

	// Validate domain format
	if (!domain.match(/^https?:\/\/.+/)) {
		console.error('Error: Domain must start with http:// or https://');
		process.exit(1);
	}

	try {
		console.log(`Generating sitemap for: ${absolutePath}`);
		console.log(`Domain: ${domain}\n`);

		const result = await generateSitemap(absolutePath, domain);

		console.log(`✓ Sitemap generated successfully!`);
		console.log(`  Location: ${result.outputPath}`);
		console.log(`  URLs found: ${result.urlCount}`);
	} catch (error) {
		console.error('Error generating sitemap:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();