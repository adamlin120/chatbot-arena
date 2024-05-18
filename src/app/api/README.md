# API Reference

## User API

Currently we use NextAuth.js for authentication. The user API is used to get the user information.

## Chat API

### Initiate Chat

Endpoint: /api/chat/initiate

Method: POST

Request: No request body

Response:

```typescript
{
  "conversationRecordId": [
    String,
    String
  ]
}
```

### Get Chat Streaming

Endpoint: /api/chat/

method: POST

Request:

```typescript
{
  "message": Messages[],
  "conversationRecordId": String
}
```

Response:

TextStreamingResponse object

### Get New Conversation Record for Regeneration

Endpoint: /api/chat/regenerate/initiate
Method: POST

Request:

```typescript
{
  "conversationRecordId": String
}
```

This should pass the old conversation record ID that you want to regenerate.

Response:

```typescript
{
  "conversationRecordId": String
}
```

This will return a new conversation record ID that you should use for the next chat streaming.

### Get Chat Streaming for Regeneration

Endpoint: /api/chat/regenerate
Method: POST

Request:

```typescript
{
  "message": Messages[],
  "conversationRecordId": String
}
```

Response:

TextStreamingResponse object

Warning: You only need to call the regenerate API when the user clicks the regenerate button. If the user sends a message to the chat, even if the conversation is regenerated, you should use the normal chat API. However, once the user clicks the regenerate button, you should use the new conversation record ID acquired from regenerate initiate API.

## Rating API

### Submit Rating

Endpoint: /api/rating
Method: POST

Request:

```json
{
  "ratings": [
    {
      "conversationRecordId": "Conversation Record ID",
      "rating": 1,
      "siblingRecordId": "Sibling Conversation Record ID"
    }
  ]
}
```

Response:

```json
{
  [
    {
      "conversationRecordId": "Conversation Record ID",
      "model" : "Model Name",
    }
  ]
}
```

If the request rating is 1, it means the completion is better than the other completion. If the request rating is 0, it means both completions are bad. If the request rating is 2, it means both completions are good. You just need to submit the rating for one conversation record, and the other conversation record will be calculated automatically.

This API will also lead to the revelation of the model name that the user has rated, and after rating, the user will not be able to rate again in this session.

### Get Leaderboard

Endpoint: /api/leaderboard
Method: GET

Response:

```json
{
    {
      "modelName": "Model A Name",
      "eloRating": 0.6
    },
    {
      "modelName": "Model B Name",
      "eloRating": 0.4
    }
}
```

The ranking is sorted by the average rating in descending order. The score is calculated using Elo.

## Conversation Record API

### Export All Conversation Records as JSON file

Endpoint: /api/conversation/export

Method: GET

Response: JSON file

Format of JSON file:

```json
{
  "model_name": "Model Name",
  "conversations": [
    {
      "prompt": "Prompt Content",
      "completions": "Completion Content"
    }
  ]
}
```

The purpose of this API is to export all conversation records as a JSON file, which our sponsor might need. The JSON file contains an array of conversation records. Each conversation record contains the prompt content, completion content, and model name.

## Rate Edited Conversation API

### Get a random edited conversation

Endpoint: /api/rating
Method: GET

Response:

```json
{
  "rateEditingID": "Rate Editing ID",
  "originalPrompt": "Original Prompt",
  "originalCompletion": "Original Completion",
  "editedPrompt": "Edited Prompt",
  "editedCompletion": "Edited Completion"
}
```

### Submit Rating for Edited Conversation

Endpoint: /api/rating
Method: POST

Request:

```json
{
  "rateEditingID": "Rate Editing ID",
  "promptEditedScore": Number(1-5),
  "completionEditedScore": Number(1-5),
  "feedback": "Feedback"
}
```

Response:

```json
{
  "success": true
}
```
