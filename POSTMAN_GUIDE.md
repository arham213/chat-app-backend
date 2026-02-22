# Postman Collection Usage Guide

## Importing the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `postman_collection.json` file from this directory
4. The collection will be imported with all endpoints ready to use

## Quick Start Testing Flow

### Step 1: Start the Server
Make sure MongoDB is running and the server is started:
```bash
npm run dev
```

### Step 2: Test Authentication

1. **Register First User**
   - Open `Authentication > Register User`
   - The request body already has sample data
   - Click **Send**
   - The token will be automatically saved to the collection variable

2. **Register Second User**
   - Open `Authentication > Register Second User`
   - Click **Send**
   - This creates another user for testing chat functionality

3. **Login**
   - Open `Authentication > Login User`
   - Click **Send**
   - Token is automatically saved and will be used for subsequent requests

### Step 3: Get Users

1. **Get All Users**
   - Open `Users > Get All Users`
   - Click **Send**
   - Copy the `_id` of another user from the response

### Step 4: Create a Chat

1. **Create or Get Chat**
   - Open `Chats > Create or Get Chat`
   - Replace `REPLACE_WITH_OTHER_USER_ID` in the request body with the user ID you copied
   - Click **Send**
   - The chat ID will be automatically saved to the collection variable

### Step 5: Get Messages

1. **Get Chat Messages**
   - Open `Chats > Get Chat Messages`
   - Click **Send** (uses the saved chatId variable)
   - Initially empty, but will show messages after sending via Socket.IO

## Collection Variables

The collection uses these variables that are automatically managed:

- `baseUrl`: Server URL (default: http://localhost:5000)
- `token`: JWT authentication token (auto-saved on login/register)
- `chatId`: Current chat ID (auto-saved when creating a chat)

## Manual Variable Configuration

If you need to change the base URL:

1. Click on the collection name
2. Go to **Variables** tab
3. Update the `baseUrl` value
4. Click **Save**

## Testing Socket.IO Events

The REST API endpoints are for initial setup. For real-time messaging, you'll need to:

1. Use a Socket.IO client (like your React app)
2. Or use a Socket.IO testing tool
3. Connect with: `io('http://localhost:5000', { auth: { token: 'YOUR_TOKEN' } })`

## Tips

- The collection automatically saves tokens after successful login/register
- Chat IDs are automatically saved when creating chats
- All authenticated endpoints use the `{{token}}` variable
- You can create multiple users by modifying the register request body

## Troubleshooting

**401 Unauthorized Error:**
- Make sure you've logged in or registered first
- Check that the token variable is set (Collection > Variables)

**404 Not Found:**
- Ensure the server is running on port 5000
- Check MongoDB is running

**Chat Creation Issues:**
- Make sure you're using a valid user ID from the "Get All Users" response
- Don't try to create a chat with yourself
