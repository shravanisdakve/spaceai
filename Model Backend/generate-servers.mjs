import fs from 'fs';
import path from 'path';

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

// Read the template
const template = fs.readFileSync('server-template.mjs', 'utf8');

// Generate servers for each domain
Object.entries(domains).forEach(([domain, ports]) => {
	const domainPath = path.join('domains', domain);
	const serverPath = path.join(domainPath, 'server.mjs');

	// Skip if the server already exists (for Finance)
	if (domain === 'Finance' && fs.existsSync(serverPath)) {
		console.log(`Skipping Finance server as it already exists`);
		return;
	}

	// Create domain-specific server content
	const serverContent = template
		.replace('domain_specific', domain.toLowerCase())
		.replace(
			'is_domain_specific',
			`is_${domain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
		)
		.replace(
			'Content is not domain specific',
			`Content is not ${domain} related`
		)
		.replace(
			'http://localhost:8000',
			`http://localhost:${ports.aiPort}`
		)
		.replace(
			'const PORT = process.env.PORT || 3000',
			`const PORT = process.env.PORT || ${ports.serverPort}`
		);

	// Write the server file
	fs.writeFileSync(serverPath, serverContent);

	// Create package.json for each domain
	const packageJson = {
		name: `${domain
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')}-server`,
		version: '1.0.0',
		type: 'module',
		dependencies: {
			express: '^4.18.2',
			cors: '^2.8.5',
			axios: '^1.6.2',
		},
		scripts: {
			start: 'node server.mjs',
		},
	};

	fs.writeFileSync(
		path.join(domainPath, 'package.json'),
		JSON.stringify(packageJson, null, 2)
	);

	console.log(
		`Generated server for ${domain} on port ${ports.serverPort} (AI port: ${ports.aiPort})`
	);
});
