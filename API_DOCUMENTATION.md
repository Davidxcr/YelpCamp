# YelpCamp API Documentation

This API provides programmatic access to YelpCamp campground data. All endpoints return JSON responses.

## Base URL
```
http://localhost:5176/api
```
For production:
```
https://your-domain.com/api
```

## Available Endpoints

### 1. Get All Campgrounds
**GET** `/api/campgrounds`

Retrieve a paginated list of campgrounds with optional filtering and sorting.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20) - Number of campgrounds per page
- `search` (string) - Search term for title, description, or location
- `location` (string) - Filter by location
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `sortBy` (string, default: 'title') - Field to sort by (title, price, location)
- `sortOrder` (string, default: 'asc') - Sort order ('asc' or 'desc')

**Example Request:**
```bash
curl "http://localhost:5176/api/campgrounds?page=1&limit=10&search=forest&sortBy=price&sortOrder=asc"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "campgrounds": [
      {
        "_id": "64f1234567890abcdef12345",
        "title": "Forest Mule Camp",
        "description": "A beautiful forest campground...",
        "location": "Yellowstone, Wyoming",
        "price": 25,
        "images": [
          {
            "url": "https://res.cloudinary.com/djsoqjxpg/image/upload/v1/yelpcamp/forest/forest_camping_1.jpg",
            "filename": "yelpcamp/forest/forest_camping_1"
          }
        ],
        "author": {
          "_id": "64f1234567890abcdef12346",
          "username": "john_doe"
        },
        "reviews": []
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalCampgrounds": 300,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

### 2. Get Specific Campground
**GET** `/api/campgrounds/:id`

Retrieve detailed information about a specific campground including reviews and statistics.

**Example Request:**
```bash
curl "http://localhost:5176/api/campgrounds/64f1234567890abcdef12345"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "campground": {
      "_id": "64f1234567890abcdef12345",
      "title": "Forest Mule Camp",
      "description": "A beautiful forest campground with hiking trails...",
      "location": "Yellowstone, Wyoming",
      "price": 25,
      "images": [...],
      "author": {
        "_id": "64f1234567890abcdef12346",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "reviews": [
        {
          "_id": "64f1234567890abcdef12347",
          "rating": 5,
          "body": "Amazing campground!",
          "author": {
            "_id": "64f1234567890abcdef12348",
            "username": "jane_smith"
          },
          "createdAt": "2023-09-01T10:30:00.000Z"
        }
      ]
    },
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "createdAt": "2023-08-15T14:20:00.000Z"
    }
  }
}
```

### 3. Search Campgrounds
**GET** `/api/campgrounds/search/:term`

Search for campgrounds by term in title, description, or location.

**Query Parameters:**
- `limit` (number, default: 10) - Maximum number of results

**Example Request:**
```bash
curl "http://localhost:5176/api/campgrounds/search/forest?limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "searchTerm": "forest",
    "results": 5,
    "campgrounds": [
      {
        "_id": "64f1234567890abcdef12345",
        "title": "Forest Mule Camp",
        "location": "Yellowstone, Wyoming",
        "price": 25,
        "images": [...],
        "description": "A beautiful forest campground...",
        "author": {
          "_id": "64f1234567890abcdef12346",
          "username": "john_doe"
        }
      }
    ]
  }
}
```

### 4. Get Campgrounds by Category
**GET** `/api/campgrounds/category/:type`

Get campgrounds filtered by category type.

**Valid Categories:**
- `ocean` - Ocean, sea, bay, beach, coast, bayshore campgrounds
- `mountain` - Mountain, peak, summit, alpine, ridge campgrounds
- `desert` - Desert, sand, dune, mesa, canyon campgrounds
- `river` - River, creek, stream, rapids, waterfall, creekside campgrounds
- `lake` - Lake, pond, reservoir, lagoon campgrounds
- `forest` - Forest, woods, trees, woodland campgrounds

**Query Parameters:**
- `limit` (number, default: 20) - Maximum number of results

**Example Request:**
```bash
curl "http://localhost:5176/api/campgrounds/category/ocean?limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "category": "ocean",
    "results": 10,
    "campgrounds": [
      {
        "_id": "64f1234567890abcdef12349",
        "title": "Ocean Bay Camp",
        "location": "California Coast",
        "price": 35,
        "images": [...],
        "description": "Beachfront camping with ocean views...",
        "author": {
          "_id": "64f1234567890abcdef12350",
          "username": "beach_lover"
        }
      }
    ]
  }
}
```

### 5. Get Statistics
**GET** `/api/stats`

Get general statistics about the campgrounds and reviews.

**Example Request:**
```bash
curl "http://localhost:5176/api/stats"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalCampgrounds": 300,
    "totalReviews": 1250,
    "pricing": {
      "avgPrice": 28.5,
      "minPrice": 15,
      "maxPrice": 75
    },
    "topLocations": [
      {
        "_id": "Yellowstone, Wyoming",
        "count": 25
      },
      {
        "_id": "Yosemite, California",
        "count": 20
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (campground doesn't exist)
- `500` - Internal Server Error

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Get all campgrounds
const response = await fetch('/api/campgrounds?page=1&limit=10');
const data = await response.json();
console.log(data.data.campgrounds);

// Get specific campground
const campgroundId = '64f1234567890abcdef12345';
const campground = await fetch(`/api/campgrounds/${campgroundId}`);
const campgroundData = await campground.json();
console.log(campgroundData.data.campground);

// Search campgrounds
const searchResults = await fetch('/api/campgrounds/search/forest');
const searchData = await searchResults.json();
console.log(searchData.data.campgrounds);
```

### Python (requests)
```python
import requests

# Get all campgrounds
response = requests.get('http://localhost:5176/api/campgrounds', params={
    'page': 1,
    'limit': 10,
    'search': 'forest'
})
data = response.json()
print(data['data']['campgrounds'])

# Get specific campground
campground_id = '64f1234567890abcdef12345'
response = requests.get(f'http://localhost:5176/api/campgrounds/{campground_id}')
campground_data = response.json()
print(campground_data['data']['campground'])
```

### cURL Examples
```bash
# Get campgrounds with filtering
curl -X GET "http://localhost:5176/api/campgrounds?search=forest&minPrice=20&maxPrice=50&sortBy=price&sortOrder=asc"

# Get campground by ID
curl -X GET "http://localhost:5176/api/campgrounds/64f1234567890abcdef12345"

# Search campgrounds
curl -X GET "http://localhost:5176/api/campgrounds/search/mountain"

# Get ocean campgrounds
curl -X GET "http://localhost:5176/api/campgrounds/category/ocean"

# Get statistics
curl -X GET "http://localhost:5176/api/stats"
```

## Rate Limiting & Best Practices

1. **Pagination**: Always use pagination for large datasets
2. **Filtering**: Use specific filters to reduce response size
3. **Caching**: Consider caching responses for frequently accessed data
4. **Error Handling**: Always check the `success` field in responses

## Authentication

Currently, the API endpoints are public and don't require authentication. If you need to add authentication in the future, you can modify the routes to include authentication middleware.

## CORS

If you need to access the API from a different domain, you may need to configure CORS in your Express application. 