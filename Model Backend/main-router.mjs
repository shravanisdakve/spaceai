import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	methods: ['POST'],
	credentials: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3030;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '600000'); // 10 minutes
const AGENT_TIMEOUT = parseInt(process.env.AGENT_TIMEOUT || '720000'); // 12 minutes

const agent = new http.Agent({
	keepAlive: true,
	timeout: AGENT_TIMEOUT,
});

// Domain to port mapping
const domainPorts = {
	finance: 3000,
	mathematics: 3001,
	programming: 3003,
	psychology: 3005,
	physics: 3006,
	chemistry: 3007,
	biology: 3008,
	legal: 3009,
	marketing: 3011,
	'ui-ux design': 3012,
	'product management': 3014,
	music: 3015,
	'art & style': 3016,
	'philosophy & ethics': 3017,
	cybersecurity: 3019,
	'data science': 3021,
	productivity: 3022,
	'mental health': 3023,
};

// Input validation middleware
const validateRequest = (req, res, next) => {
	const { text, domain, context } = req.body;

	if (!text) {
		return res.status(400).json({ error: 'Text is required' });
	}

	if (!domain) {
		return res.status(400).json({ error: 'Domain is required' });
	}

	if (!context || !context.subject || !context.level || !context.format) {
		return res.status(400).json({
			error: 'Context with subject, level, and format is required',
		});
	}

	const normalizedDomain = domain.toLowerCase();
	if (!domainPorts[normalizedDomain]) {
		return res.status(400).json({
			error: 'Invalid domain',
			available_domains: Object.keys(domainPorts),
		});
	}

	next();
};

app.post('/api/analyze-text', validateRequest, async (request, response) => {
	console.log('Request received');
	console.log(request.body);

	try {
		const {
			text,
			domain,
			context: { subject, level, format },
		} = request.body;

		const normalizedDomain = domain.toLowerCase();
		const port = domainPorts[normalizedDomain];

		const apiResponse = await axios.post(
			`http://localhost:${port}/api/analyze-text`,
			{
				text: text,
				queryType: normalizedDomain,
				model_size: '8b',
				advanced_analysis: true,
				domain: domain,
				context: {
					subject,
					level,
					format,
				},
			},
			{
				timeout: REQUEST_TIMEOUT,
				httpAgent: agent,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		const data = apiResponse.data;
		console.log('Response received');
		return response.json(data);
	} catch (err) {
		console.error('Error:', err.message || err);
		console.log('Failed to get the response');

		// Handle specific error cases
		if (err.code === 'ECONNREFUSED') {
			return response.status(503).json({
				error: 'Domain service is currently unavailable',
				details: err.message,
			});
		}

		if (err.response) {
			// Forward the error response from the domain server
			return response
				.status(err.response.status)
				.json(err.response.data);
		}

		return response.status(500).json({
			error: 'Failed to analyze text',
			details: err.message,
		});
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({
		status: 'healthy',
		domains: Object.keys(domainPorts).map((domain) => ({
			domain,
			port: domainPorts[domain],
		})),
	});
});

app.listen(PORT, () => {
	console.log(`Main router started at port ${PORT}`);
	console.log('Available domains:');
	Object.entries(domainPorts).forEach(([domain, port]) => {
		console.log(`- ${domain}: http://localhost:${port}`);
	});
});
