import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsPath = __dirname;

const domainPorts = {
    'Finance': 8000,
    'Mathematics': 8001,
    'Programming': 8003,
    'Psychology': 8005,
    'Physics': 8006,
    'Chemistry': 8007,
    'Biology': 8008,
    'Legal': 8009,
    'Marketing': 8011,
    'UI-UX_Design': 8012,
    'Product_Management': 8014,
    'Music': 8015,
    'Art_Style': 8016,
    'Philosophy_Ethics': 8017,
    'Cybersecurity': 8019,
    'Data_Science': 8021,
    'Productivity': 8022,
    'Mental_Health': 8023,
    'general': 8024 // Assuming a port for the general model
};

function startApi(domain, port) {
    const domainPath = path.join(modelsPath, domain);
    const apiPath = path.join(domainPath, 'main.py');

    if (!fs.existsSync(apiPath)) {
        console.error(`API file not found for ${domain} at ${apiPath}`);
        return null;
    }

    console.log(`Starting ${domain} API at ${apiPath} on port ${port}`);

    const pythonExecutable = path.join(modelsPath, '.venv', 'Scripts', 'python.exe');

    if (!fs.existsSync(pythonExecutable)) {
        console.error(`Python executable not found at ${pythonExecutable}`);
        return null;
    }

    const api = spawn(pythonExecutable, [apiPath], {
        cwd: domainPath,
        stdio: 'pipe',
        env: {
            ...process.env,
            PYTHONUNBUFFERED: "1"
        },
    });

    api.stdout.on('data', (data) => {
        console.log(`[${domain}] ${data.toString().trim()}`);
    });

    api.stderr.on('data', (data) => {
        console.error(`[${domain}] Error: ${data.toString().trim()}`);
    });

    api.on('close', (code) => {
        console.log(`[${domain}] API stopped with code ${code}`);
    });

    return api;
}

console.log('Starting all Python APIs...');
const apis = new Map();

Object.entries(domainPorts).forEach(([domain, port]) => {
    const apiProcess = startApi(domain, port);
    if (apiProcess) {
        apis.set(domain, apiProcess);
    }
});

process.on('SIGINT', () => {
    console.log('\nShutting down APIs...');
    apis.forEach((api, domain) => {
        console.log(`Stopping ${domain} API...`);
        api.kill();
    });
    process.exit(0);
});

console.log('\nAll APIs started. Press Ctrl+C to stop all APIs.');
