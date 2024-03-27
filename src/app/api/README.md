# API Reference

All headers should contain Authorization header with JWT token

## User API
Pass for now since some of which are currently handled by Liliang.

## Rating API

### Submit Rating

Endpoint: /api/rating
Method: POST

Request:
```json
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
    "rating": 1, // 1 means completion A is better, 0 means equally good, 2means completion B is better, -1 means equally bad
    "feedback": "Feedback"
}
```

Response:
```json
{
    "success": true
}
```

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