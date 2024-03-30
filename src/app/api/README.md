# API Reference

All headers should contain Authorization header with JWT token

## Schema

See ./prisma/schema.prisma for the schema definition.
The conversation related part needs extra explanation.
Below is the schema for conversation:

```
model Conversation {
  id             String   @id @map("_id") @default(auto()) @db.ObjectId
  contributor    User     @relation(fields: [contributorId], references: [id])
  contributorId  String   @db.ObjectId
  records        ConversationRecord[]
}

model ConversationRecord {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  rounds ConversationRound[]
  conversation Conversation @relation(fields: [conversationId], references: [id])
  conversationId String @db.ObjectId
}

model ConversationRound {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  prompt     String
  completion    String
  model_name String
  rating     Int
  ConversationRecord ConversationRecord @relation(fields: [ConversationRecordId], references: [id])
  ConversationRecordId String @db.ObjectId
}
```

Conversation is the main entity, which contains a list of conversation records in a session. For Chatbot Arena, there are two conversation records in a session since there are two conversations going on at the same time. Each conversation record contains a list of conversation rounds, which are the conversation history of the user and the chatbot. Each conversation round contains the prompt, completion, model name, and rating.

An example data structure of conversation:

```json
{
  "id": "60f3b3b3b3b3b3b3b3b3b3b3",
  "contributor": {
    "id": "60f3b3b3b3b3b3b3b3b3b3b3"
  },
  "records": [
    {
      "id": "60f3b3b3b3b3b3b3b3b3b3",
      "rounds": [
        {
          "id": "60f3b3b3b3b3b3b3b3b3b3",
          "prompt": "Prompt Content",
          "completion": "Completion Content",
          "model_name": "Model Name",
          "rating": 1
        }
      ]
    },
    {
      "id": "60f3b3b3b3b3b3b3b3b3b3",
      "rounds": [
        {
          "id": "60f3b3b3b3b3b3b3b3b3b3",
          "prompt": "Prompt Content",
          "completion": "Completion Content",
          "model_name": "Model Name",
          "rating": 1
        }
      ]
    }
  ]
}
```

For the rating part, the rating is an integer. 1 means the completion is better than the other completion, 0 means equal, -1 means the completion is worse than the other completion.

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
