# 🌍 Country Currency API

## Overview
This is a robust Node.js Express.js backend API designed to fetch, process, and serve comprehensive country data including population, capital, region, currency information, and estimated GDP. It leverages external APIs for data acquisition, persists information in a MySQL database, and features a dynamic image generation service for reporting.

## Features
- **Data Synchronization**: Automatically fetches and updates country data and currency exchange rates from `restcountries.com` and `exchangerate-api.com`.
- **Database Persistence**: Efficiently stores and manages country metadata using MySQL2.
- **RESTful Endpoints**: Provides a clean and intuitive API for retrieving, filtering, and managing country information.
- **Data Filtering & Sorting**: Supports queries by region, currency, and various sorting options (GDP, population, name).
- **Rate Limiting & Security**: Implements `express-rate-limit`, `helmet`, and `cors` for enhanced API security and stability.
- **Input Validation**: Utilizes `express-validator` to ensure data integrity and prevent common API vulnerabilities.
- **Dynamic Image Generation**: Generates a visual summary image displaying total countries and top GDP performers using `canvas`.
- **Health Monitoring**: Includes dedicated endpoints for application health and status checks.
- **Modular Architecture**: Organized into controllers, services, models, and middleware for maintainability and scalability.

## Getting Started

### Installation
To get this project up and running locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/stage2backend.git
    cd stage2backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    Ensure you have a MySQL server running.
    *   Create a database (e.g., `country_db`).
    *   Run the migration script to create the necessary tables:
        ```bash
        node src/scripts/migrate.script.js
        ```

### Environment Variables
Create a `.env` file in the root directory of the project. For development, you can create `.env.development.local`. Populate it with the following variables:

```
# Application Configuration
PORT=3000
SERVER_URL=http://localhost

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=country_db
# DB_URL=mysql://user:password@host:port/database # Optional: If you prefer a full URL connection string

# Rate Limiting (Optional, defaults are provided)
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100 # Max 100 requests per window

# External API Timeout (Optional, defaults to 10000ms)
EXTERNAL_API_TIMEOUT=15000 # Timeout for external API calls in milliseconds
```

### Running the Project
To start the development server:
```bash
npm run dev
```
To start the production server:
```bash
npm start
```
The API will be accessible at `http://localhost:3000` (or your configured `PORT`).

## API Documentation

### Base URL
`http://localhost:3000` (or your configured `SERVER_URL`:`PORT`)

### Endpoints

#### POST /countries/refresh
Initiates a refresh of all country data and exchange rates from external sources. This operation can be time-consuming and should be managed carefully.

**Request**:
```json
{}
```
(No request body required)

**Response**:
```json
{
  "message": "Countries refreshed successfully",
  "processed": 250
}
```

**Errors**:
- 503: External data source unavailable.
  ```json
  {
    "error": "External data source unavailable",
    "details": "Could not fetch data from [https://restcountries.com/v2/all],https://api.exchangerate-api.com/v4/latest/ "
  }
  ```
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### GET /countries
Retrieves a list of all stored countries, with optional filtering and sorting capabilities.

**Request**:
Query Parameters:
- `region`: (Optional) Filter countries by region (e.g., `Europe`, `Africa`).
- `currency`: (Optional) Filter countries by currency code (e.g., `USD`, `EUR`).
- `sort`: (Optional) Sort order for the results. Accepted values:
    - `gdp_desc`: Estimated GDP (descending)
    - `gdp_asc`: Estimated GDP (ascending)
    - `name_asc`: Country name (ascending)
    - `name_desc`: Country name (descending)
    - `population_desc`: Population (descending)
    - `population_asc`: Population (ascending)

**Example Request**:
`GET /countries?region=Asia&sort=population_desc`

**Response**:
```json
[
  {
    "id": 1,
    "name": "China",
    "capital": "Beijing",
    "region": "Asia",
    "population": 1400000000,
    "currency_code": "CNY",
    "exchange_rate": 6.8,
    "estimated_gdp": 15000000000000.00,
    "flag_url": "https://restcountries.com/data/chn.svg",
    "last_refreshed_at": "2023-10-26T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "India",
    "capital": "New Delhi",
    "region": "Asia",
    "population": 1380000000,
    "currency_code": "INR",
    "exchange_rate": 83.2,
    "estimated_gdp": 3500000000000.00,
    "flag_url": "https://restcountries.com/data/ind.svg",
    "last_refreshed_at": "2023-10-26T10:00:00.000Z"
  }
]
```

**Errors**:
- 400: Validation failed for query parameters.
  ```json
  {
    "error": "Validation failed"
    // "details": { "region": "Region must be between 1 and 100 characters" } // Only in development
  }
  ```
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### GET /countries/image
Retrieves a dynamically generated summary image (PNG) of the API's current status, including total countries and top GDP performers.

**Request**:
```json
{}
```
(No request body or parameters required)

**Response**:
(Binary image data - `Content-Type: image/png`)

**Errors**:
- 404: Image not found (if the image has not been generated yet).
  ```json
  {
    "error": "Image not found"
  }
  ```
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### GET /countries/status
Provides information about the API's current data status, including the total number of countries stored and the timestamp of the last data refresh.

**Request**:
```json
{}
```
(No request body or parameters required)

**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-26T10:00:00.000Z"
}
```

**Errors**:
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### GET /countries/:name
Retrieves detailed information for a single country by its name.

**Request**:
Path Parameter:
- `name`: The full name of the country (e.g., `Nigeria`, `United States`).

**Example Request**:
`GET /countries/Nigeria`

**Response**:
```json
{
  "id": 10,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 210000000,
  "currency_code": "NGN",
  "exchange_rate": 410.0,
  "estimated_gdp": 450000000000.00,
  "flag_url": "https://restcountries.com/data/nga.svg",
  "last_refreshed_at": "2023-10-26T10:00:00.000Z"
}
```

**Errors**:
- 400: Validation failed for the country name parameter.
  ```json
  {
    "error": "Validation failed"
    // "details": { "name": "Country name is required and must be between 1 and 255 characters" } // Only in development
  }
  ```
- 404: Country not found.
  ```json
  {
    "error": "Country not found"
  }
  ```
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### DELETE /countries/:name
Deletes a specific country record from the database by its name.

**Request**:
Path Parameter:
- `name`: The full name of the country to delete (e.g., `Germany`).

**Example Request**:
`DELETE /countries/Germany`

**Response**:
```json
{
  "message": "Country deleted successfully"
}
```

**Errors**:
- 400: Validation failed for the country name parameter.
  ```json
  {
    "error": "Validation failed"
    // "details": { "name": "Country name is required and must be between 1 and 255 characters" } // Only in development
  }
  ```
- 404: Country not found.
  ```json
  {
    "error": "Country not found"
  }
  ```
- 500: Internal server error.
  ```json
  {
    "error": "Internal server error"
  }
  ```

#### GET /health
A simple health check endpoint to verify the API's operational status.

**Request**:
```json
{}
```
(No request body or parameters required)

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2023-10-26T10:00:00.000Z"
}
```

#### GET /
The root endpoint provides general information about the API, including a list of available endpoints.

**Request**:
```json
{}
```
(No request body or parameters required)

**Response**:
```json
{
  "status": "success",
  "message": "Country Currency API",
  "endpoints": {
    "refresh": "http://localhost:3000/refresh",
    "getCountries": "http://localhost:3000/countries",
    "getCountry": "http://localhost:3000/countries/:name",
    "deleteCountry": "http://localhost:3000/countries/:name",
    "getStatus": "http://localhost:3000/status",
    "getImage": "http://localhost:3000/image",
    "health": "http://localhost:3000/health"
  }
}
```

## Technologies Used
| Technology         | Description                                                                 |
| :----------------- | :-------------------------------------------------------------------------- |
| **Node.js**        | JavaScript runtime environment                                              |
| **Express.js**     | Web framework for Node.js                                                   |
| **MySQL2**         | MySQL client for Node.js with Promises API                                  |
| **Axios**          | Promise-based HTTP client for the browser and Node.js                       |
| **Canvas**         | Node.js graphics API that implements the HTML Canvas Standard               |
| **Dotenv**         | Loads environment variables from a `.env` file                              |
| **Compression**    | Node.js compression middleware for Express                                  |
| **CORS**           | Middleware for enabling Cross-Origin Resource Sharing                       |
| **Helmet**         | Secures Express apps by setting various HTTP headers                        |
| **Express Rate Limit** | Basic IP rate-limiting middleware for Express applications              |
| **Express Validator** | Express.js middleware for data validation and sanitization                |
| **Winston**        | A versatile logging library for Node.js                                     |
| **Nodemon**        | Utility that monitors for changes in Node.js source and automatically restarts the server |

## Author Info

Connect with the author:
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourusername)
- Twitter: [@yourtwitterhandle](https://twitter.com/yourtwitterhandle)
- Portfolio: [Your Portfolio Website](https://yourportfolio.com)

## License
This project is licensed under the ISC License.

---
[![Node.js](https://img.shields.io/badge/Node.js-v20-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-informational.svg?logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-DB-blue.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)