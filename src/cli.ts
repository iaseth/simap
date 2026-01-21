#!/usr/bin/env node

import { generateSitemap } from './index';
import * as path from 'path';
import * as fs from 'fs';

function showHelp(): void {
	console.log(`
simap - Sitemap Generator

Usage:
  simap <dirpath> <domain> [options]

Arguments:
  dirpath    Directory path to scan for files
  domain     Base domain URL (e.g., https://example.com)

Options:
  --ignore, -i <route>    Ignore routes starting with the specified path (can be used multiple times)
  --help, -h              Show this help message

Examples:
  simap ./public https://example.com
  simap ./public https://example.com --ignore /admin --ignore /private
  simap ./public https://example.com -i /blog/draft -i /test
	`);
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		showHelp();
		process.exit(0);
	}

	// Parse arguments
	const positionalArgs: string[] = [];
	const ignoreRoutes: string[] = [];
	
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		
		if (arg === '--ignore' || arg === '-i') {
			if (i + 1 < args.length) {
				ignoreRoutes.push(args[i + 1]);
				i++; // Skip next arg
			} else {
				console.error('Error: --ignore flag requires a value\n');
				showHelp();
				process.exit(1);
			}
		} else if (!arg.startsWith('-')) {
			positionalArgs.push(arg);
		}
	}

	if (positionalArgs.length < 2) {
		console.error('Error: Missing required arguments\n');
		showHelp();
		process.exit(1);
	}

	const [dirPath, domain] = positionalArgs;

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
		console.log(`Domain: ${domain}`);
		if (ignoreRoutes.length > 0) {
			console.log(`Ignoring routes starting with: ${ignoreRoutes.join(', ')}`);
		}
		console.log('');

		const result = await generateSitemap(absolutePath, domain, {
			ignoreRoutes
		});

		console.log(`✓ Sitemap generated successfully!`);
		console.log(`  Location: ${result.outputPath}`);
		console.log(`  URLs found: ${result.urlCount}`);
		if (result.ignoredCount > 0) {
			console.log(`  URLs ignored: ${result.ignoredCount}`);
		}
	} catch (error) {
		console.error('Error generating sitemap:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();