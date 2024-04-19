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
      "rating": 1
    }
  ]
}
```

Response:

```json
{
  "success": true
}
```

The rating is an integer. 1 means the completion is better than the other completion, 0 means equal, -1 means the completion is worse than the other completion. If one element in the ratings array is rated as 1, the other element should be rated as -1. The ratings array should contain two elements since there are two conversations going on at the same time.

### Get All Ratings as JSON file

Endpoint: /api/rating/export
Method: GET

Response: JSON file

Format of JSON file:

```json
{
  "ratings": [
    {
      "prompt": "Prompt Content",
      "completions": [
        {
          "content": "Completion A Content",
          "model_name": "Model A Name"
        },
        {
          "content": "Completion B Content",
          "model_name": "Model B Name"
        }
      ],
      "rating": 1,
      "feedback": "Feedback"
    }
  ]
}
```

### Get Ratings By Model

Endpoint: /api/rating/model
Method: GET

Request:

```json
{
  "model_name": "Model Name"
}
```

Response:

```json
{
  "ratings": [
    {
      "prompt": "Prompt Content",
      "completions": [
        {
          "content": "Completion A Content",
          "model_name": "Model A Name"
        },
        {
          "content": "Completion B Content",
          "model_name": "Model B Name"
        }
      ],
      "rating": 1,
      "feedback": "Feedback"
    }
  ]
}
```

### Get Average Rating By Model

Endpoint: /api/rating/model/average
Method: GET

Request:

```json
{
  "model_name": "Model Name"
}
```

Response:

```json
{
  "average_rating": 0.6
}
```

The average rating is calculated by the proportion that a model is rated better than the other model. For example, if 10 ratings are submitted, and 6 of them are rated better than the other model, the average rating is 0.6.

### Get Ratings Ranking of All Models

Endpoint: /api/rating/ranking
Method: GET

Response:

```json
{
  "rankings": [
    {
      "model_name": "Model A Name",
      "average_rating": 0.6
    },
    {
      "model_name": "Model B Name",
      "average_rating": 0.4
    }
  ]
}
```

The ranking is sorted by the average rating in descending order.

## Conversation Record API

### Export All Conversation Records as JSON file

Endpoint: /api/conversation/export

Method: GET

Response: JSON file

Format of JSON file:

```json
{
  "conversations": [
    {
      "prompt": "Prompt Content",
      "completions": "Completion Content",
      "model_name": "Model Name"
    }
  ]
}
```

The purpose of this API is to export all conversation records as a JSON file, which our sponsor might need. The JSON file contains an array of conversation records. Each conversation record contains the prompt content, completion content, and model name.
