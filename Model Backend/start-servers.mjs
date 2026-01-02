import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const domains = {
	Finance: { aiPort: 8000, serverPort: 3000 },
	Mathematics: { aiPort: 8001, serverPort: 3001 },
	Programming: { aiPort: 8003, serverPort: 3003 },
	Psychology: { aiPort: 8005, serverPort: 3005 },
	Physics: { aiPort: 8006, serverPort: 3006 },
	Chemistry: { aiPort: 8007, serverPort: 3007 },
	Biology: { aiPort: 8008, serverPort: 3008 },
	Legal: { aiPort: 8009, serverPort: 3009 },
	Marketing: { aiPort: 8011, serverPort: 3011 },
	'UI-UX Design': { aiPort: 8012, serverPort: 3012 },
	'Product Management': { aiPort: 8014, serverPort: 3014 },
	Music: { aiPort: 8015, serverPort: 3015 },
	'Art & Style': { aiPort: 8016, serverPort: 3016 },
	'Philosophy & Ethics': { aiPort: 8017, serverPort: 3017 },
	Cybersecurity: { aiPort: 8019, serverPort: 3019 },
	'Data Science': { aiPort: 8021, serverPort: 3021 },
	Productivity: { aiPort: 8022, serverPort: 3022 },
	'Mental Health': { aiPort: 8023, serverPort: 3023 },
};

// Function to start a server
function startServer(domain, ports) {
	const domainPath = path.join(process.cwd(), 'domains', domain);
	const serverPath = path.join(domainPath, 'server.mjs');

	if (!fs.existsSync(serverPath)) {
		console.error(
			`Server file not found for ${domain} at ${serverPath}`
		);
		return null;
	}

	console.log(
		`Starting ${domain} server at ${serverPath} on port ${ports.serverPort}`
	);

	const server = spawn('node', [serverPath], {
		cwd: domainPath,
		stdio: 'pipe',
		env: {
			...process.env,
			PORT: ports.serverPort,
		},
	});

	server.stdout.on('data', (data) => {
		console.log(`[${domain}] ${data.toString().trim()}`);
	});

	server.stderr.on('data', (data) => {
		console.error(`[${domain}] Error: ${data.toString().trim()}`);
	});

	server.on('close', (code) => {
		console.log(`[${domain}] Server stopped with code ${code}`);
	});

	return server;
}

// Start all domain servers
console.log('Starting domain servers...');
const servers = new Map();

Object.entries(domains).forEach(([domain, ports]) => {
	console.log(`Starting ${domain} server...`);
	const server = startServer(domain, ports);
	if (server) {
		servers.set(domain, server);
	}
});

// Start main router
console.log('\nStarting main router...');
const mainRouter = spawn('node', ['main-router.mjs'], {
	stdio: 'pipe',
	env: {
		...process.env,
		PORT: 30146,
	},
});

mainRouter.stdout.on('data', (data) => {
	console.log(`[Main Router] ${data.toString().trim()}`);
});

mainRouter.stderr.on('data', (data) => {
	console.error(`[Main Router] Error: ${data.toString().trim()}`);
});

mainRouter.on('close', (code) => {
	console.log(`[Main Router] Stopped with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
	console.log('\nShutting down servers...');

	// Stop main router
	mainRouter.kill();

	// Stop all domain servers
	servers.forEach((server, domain) => {
		console.log(`Stopping ${domain} server...`);
		server.kill();
	});

	process.exit(0);
});

console.log('\nAll servers started. Press Ctrl+C to stop all servers.');
