// backend/routes/dialogflowRoute.js
import express from 'express';
import dialogflow from '@google-cloud/dialogflow';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuid } from 'uuid';

dotenv.config();

const dialogflowRoute = express.Router();

const CREDENTIALS_PATH = path.resolve('./dialogflow-key.json'); // Update with your key file path
const projectId = 'your-dialogflow-project-id'; // from key file

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: CREDENTIALS_PATH,
});

dialogflowRoute.post('/message', async (req, res) => {
  const { message } = req.body;

  const sessionId = uuid();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (error) {
    res.status(500).json({ reply: "Sorry, I didn’t understand that. Please try again." });
  }
});

export default dialogflowRoute;
