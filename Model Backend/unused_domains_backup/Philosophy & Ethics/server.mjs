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

const PORT = process.env.PORT || 3017;
const AI_MODEL_URL = process.env.AI_MODEL_URL || 'http://localhost:8017';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '600000'); // 10 minutes
const AGENT_TIMEOUT = parseInt(process.env.AGENT_TIMEOUT || '720000'); // 12 minutes

const agent = new http.Agent({
	keepAlive: true,
	timeout: AGENT_TIMEOUT,
});

// Input validation middleware
const validateRequest = (req, res, next) => {
	const { text, query_type, domain, context } = req.body;

	if (!text) {
		return res.status(400).json({ error: 'Text is required' });
	}

	if (!context || !context.subject || !context.level || !context.format) {
		return res
			.status(400)
			.json({
				error: 'Context with subject, level, and format is required',
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
			query_type,
			domain,
			context: { subject, level, format },
		} = request.body;

		const apiResponse = await axios.post(
			`${AI_MODEL_URL}/analyze`,
			{
				text: text,
				queryType: query_type || 'philosophy & ethics',
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

		if (!data.is_philosophy___ethics) {
			return response.status(400).json({
				error: 'Content is not Philosophy & Ethics related',
				message: data.summary,
				confidence: data.domain_confidence,
			});
		}
		console.log('Response received');
		return response.json(data);
	} catch (err) {
		console.error('Error:', err.message || err);
		console.log('Failed to get the response');
		return response.status(500).json({
			error: 'Failed to analyze text',
			details: err.message,
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server started at port ${PORT}`);
});
