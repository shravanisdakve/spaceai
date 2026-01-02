import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan'; // Import morgan
import { body, validationResult } from 'express-validator'; // Import express-validator

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // Use morgan for request logging

// Apply rate limiting to all requests
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration
const corsOptions = {
	origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173'],
	methods: ['GET', 'POST'],
	credentials: true,
};
app.use(cors(corsOptions));

// CSRF Protection
const csrfProtection = csurf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
    } 
});
app.use(csrfProtection);

// API endpoint to get the CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

const PORT = process.env.PORT || 8020;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '600000'); // 10 minutes
const AGENT_TIMEOUT = parseInt(process.env.AGENT_TIMEOUT || '720000'); // 12 minutes

// Validation middleware for /api/chat
const validateChatRequest = [
    body('tutor_id')
        .notEmpty().withMessage('tutor_id is required')
        .isString().withMessage('tutor_id must be a string'),
    body('messages')
        .isArray({ min: 1 }).withMessage('messages array is required and must not be empty'),
    body('messages.*.role')
        .notEmpty().withMessage('Message role is required')
        .isIn(['user', 'model']).withMessage('Message role must be "user" or "model"'),
    body('messages.*.parts')
        .isArray({ min: 1 }).withMessage('Message parts array is required and must not be empty'),
    body('messages.*.parts.*.text')
        .notEmpty().withMessage('Message part text is required')
        .isString().withMessage('Message part text must be a string'),
];

// Custom middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Add a 'general_tutor' to the list of domains
const domainPorts = {
	general: 8024, // General-purpose queries
	finance: 8000,
	mathematics: 8001,
	programming: 8003,
	psychology: 8005,
	physics: 8006,
	chemistry: 8007,
	biology: 8008,
	legal: 8009,
	marketing: 8011,
	'ui-ux design': 8012,
	'product management': 8014,
	music: 8015,
	'art & style': 8016,
	'philosophy & ethics': 8017,
	cybersecurity: 8019,
	'data science': 8021,
	productivity: 8022,
	'mental health': 8023,
};

// Endpoint to get the list of available tutors
app.get('/api/tutors', (req, res) => {
	const tutors = Object.keys(domainPorts).map((domain) => {
		const displayName = domain
			.replace(/_/g, ' ')
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

		return {
			id: domain,
			display_name: displayName,
			topic: displayName,
			ollama_model: '',
		};
	});
	res.json(tutors);
});

app.post('/api/chat', validateChatRequest, validateRequest, async (request, response, next) => {
	console.log('Request received for /api/chat');
	console.log(request.body);

	try {
		const { messages, tutor_id } = request.body;

		// Manual validation checks removed, now handled by express-validator
		// const { messages, tutor_id } = request.body;

		// if (!messages || !Array.isArray(messages) || messages.length === 0) {
		// 	return response.status(400).json({ error: 'Messages array is required' });
		// }
		// if (!tutor_id) {
		// 	return response.status(400).json({ error: 'tutor_id is required' });
		// }

		const lastMessage = messages[messages.length - 1];
		// This check is now covered by express-validator
		// if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.parts) {
		// 	return response.status(400).json({ error: 'Invalid last message format' });
		// }

		const text = lastMessage.parts.map(p => p.text).join('\n');
		const normalizedDomain = tutor_id.toLowerCase();
		const port = domainPorts[normalizedDomain];

		if (!port) {
			return response.status(400).json({
				error: 'Invalid tutor_id (domain)',
				available_domains: Object.keys(domainPorts),
			});
		}

		// Mocked context for now, as the new API doesn't provide it.
		// This might need to be adjusted based on Python service requirements.
		const context = {
			subject: normalizedDomain,
			level: 'intermediate',
			format: 'chat',
		};

		        const apiResponse = await axios.post(
		            `http://localhost:${port}/analyze`,
		            {
		                text: text,
		                queryType: normalizedDomain,
		                model_size: '8b',
		                advanced_analysis: true,
		                domain: tutor_id,
		                context: context,
		            },
		            {
		                responseType: 'stream', // Important for streaming
		                timeout: REQUEST_TIMEOUT,
		                headers: {
		                    'Content-Type': 'application/json',
		                },
		            }
		        );
		
		        // Pipe the response stream directly to the client
		        response.setHeader('Content-Type', 'application/json');
		        apiResponse.data.pipe(response);
		
		    } catch (err) {
				next(err); // Pass error to global error handler
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

// CSRF Error Handler (This needs to be before the general error handler)
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({ error: 'Invalid CSRF token' });
    } else {
      next(err); // Pass to next error middleware (our general handler)
    }
});

// Global Error Handler - Must be the last middleware
app.use((err, req, res, next) => {
    console.error('Unhandled API Error:', err); // Log the error for debugging

    // Handle Axios errors (e.g., from Python domain services)
    if (err.isAxiosError) {
        if (err.response) {
            // Forward the error response from the domain server
            return res.status(err.response.status).json(err.response.data);
        } else if (err.request) {
            // The request was made but no response was received
            return res.status(500).json({ error: 'No response received from domain service', details: err.message });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({ error: 'Error making request to domain service', details: err.message });
        }
    }

    // Handle specific application errors or generic errors
    if (err instanceof Error) {
        // You might define custom error classes with statusCode property
        // For now, default to 500
        return res.status((err as any).statusCode || 500).json({
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }

    // Fallback for non-Error objects
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    });
});

app.listen(PORT, () => {
	console.log(`Main router started at port ${PORT}`);
	console.log('Available domains:');
	Object.entries(domainPorts).forEach(([domain, port]) => {
		console.log(`- ${domain}: http://localhost:${port}`);
	});
});
