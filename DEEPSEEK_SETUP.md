# DeepSeek R1 B4 Setup Guide

This guide will help you connect the chatbot to DeepSeek R1 B4, either via API or by running the model locally.

# Option 1: Using DeepSeek Cloud API

## Step 1: Get Your DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy your API key (keep it secure!)

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root directory of your project (same level as `package.json`)
2. Add the following line to your `.env` file:

```
VITE_DEEPSEEK_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual DeepSeek API key.

**Note:** If you want to use a local model instead, skip to "Option 2: Running Locally" below.

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore` to protect your API key
- Restart your development server after creating/updating the `.env` file

## Step 3: Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

---

# Option 2: Running DeepSeek Model Locally

Running the model locally gives you:
- ✅ **No API costs** - completely free
- ✅ **Privacy** - your data never leaves your machine
- ✅ **No rate limits** - use as much as you want
- ✅ **Offline capability** - works without internet

## Method 1: Using Ollama (Recommended - Easiest)

Ollama is the easiest way to run models locally with an OpenAI-compatible API.

### Step 1: Install Ollama

1. Visit [https://ollama.com](https://ollama.com)
2. Download and install Ollama for your operating system (Windows, Mac, or Linux)
3. Verify installation by opening a terminal and running:
   ```bash
   ollama --version
   ```

### Step 2: Pull DeepSeek Model

Run one of these commands to download the DeepSeek model:

```bash
# For DeepSeek R1 (7B model - recommended, ~4.4GB)
ollama pull deepseek-r1:7b

# For DeepSeek R1 (14B model - better quality, ~8.1GB)
ollama pull deepseek-r1:14b

# For DeepSeek Coder (if you prefer coding-focused model)
ollama pull deepseek-coder:7b
```

**Note:** The first time you pull a model, it will download several GB of data. Make sure you have:
- At least 8GB RAM (16GB recommended for 7B model)
- At least 10GB free disk space
- A decent CPU or GPU (GPU recommended for faster responses)

### Step 3: Start Ollama Server

Ollama runs a local server automatically. Verify it's running:

```bash
# Check if Ollama is running (should show version info)
ollama list
```

The server should be running on `http://localhost:11434` by default.

### Step 4: Configure Environment Variables

Create or update your `.env` file:

```
# Enable local model mode
VITE_USE_LOCAL_MODEL=true

# Ollama endpoint (default)
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:11434/v1/chat/completions

# Model name (must match what you pulled with 'ollama pull')
VITE_LOCAL_MODEL_NAME=deepseek-r1:7b
```

### Step 5: Restart Development Server

```bash
npm run dev
```

The chatbot will now use your local Ollama model!

---

## Method 2: Using LM Studio

LM Studio provides a GUI for running local models.

### Step 1: Install LM Studio

1. Visit [https://lmstudio.ai](https://lmstudio.ai)
2. Download and install LM Studio
3. Open LM Studio

### Step 2: Download DeepSeek Model

1. In LM Studio, go to the "Search" tab
2. Search for "deepseek" or "deepseek-r1"
3. Download the model you want (7B or 14B)
4. Wait for download to complete

### Step 3: Start Local Server

1. Go to the "Local Server" tab in LM Studio
2. Select your downloaded DeepSeek model
3. Click "Start Server"
4. Note the server URL (usually `http://localhost:1234/v1`)

### Step 4: Configure Environment Variables

Update your `.env` file:

```
VITE_USE_LOCAL_MODEL=true
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:1234/v1/chat/completions
VITE_LOCAL_MODEL_NAME=deepseek-r1:7b
```

**Note:** LM Studio model names might differ. Check the model name in LM Studio's interface.

### Step 5: Restart Development Server

```bash
npm run dev
```

---

## Method 3: Using Custom Local API Server

If you're running your own inference server (vLLM, text-generation-inference, etc.):

### Configure Environment Variables

```
VITE_USE_LOCAL_MODEL=true
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:8000/v1/chat/completions
VITE_LOCAL_MODEL_NAME=deepseek-r1:7b
```

Make sure your server:
- Uses OpenAI-compatible API format (`/v1/chat/completions`)
- Accepts POST requests with JSON body
- Returns responses in OpenAI format

---

## Local Model Troubleshooting

### Model Not Responding

1. **Check if Ollama/LM Studio is running:**
   ```bash
   # For Ollama
   curl http://localhost:11434/api/tags
   
   # Should return a list of models
   ```

2. **Verify model name:**
   ```bash
   # For Ollama
   ollama list
   ```
   Make sure the model name in `.env` matches exactly.

3. **Check server URL:**
   - Ollama: `http://localhost:11434/v1/chat/completions`
   - LM Studio: `http://localhost:1234/v1/chat/completions`
   - Custom: Check your server documentation

### Slow Responses

- **Use GPU:** Models run much faster on GPU
- **Use smaller model:** 7B is faster than 14B
- **Reduce max_tokens:** Lower token limits = faster responses
- **Close other applications:** Free up RAM/GPU memory

### Out of Memory Errors

- **Use smaller model:** Switch from 14B to 7B
- **Close other applications:** Free up RAM
- **Reduce context window:** Lower max_tokens in the code

### CORS Errors

If you see CORS errors, you may need to:
1. Configure your local server to allow CORS
2. Or use a proxy in `vite.config.ts`

Add to `vite.config.ts`:
```typescript
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api/local': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/local/, '/v1'),
      },
    },
  },
});
```

Then update `.env`:
```
VITE_LOCAL_MODEL_ENDPOINT=/api/local/chat/completions
```

---

## Switching Between API and Local

You can easily switch between cloud API and local model:

**Use Cloud API:**
```
VITE_USE_LOCAL_MODEL=false
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

**Use Local Model:**
```
VITE_USE_LOCAL_MODEL=true
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:11434/v1/chat/completions
VITE_LOCAL_MODEL_NAME=deepseek-r1:7b
```

The chatbot will automatically detect which mode to use based on your `.env` configuration.

---

## Step 3: Restart Development Server (Cloud API)

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

## How It Works

### Health Topic Filtering

The chatbot now includes automatic health topic validation:

- **Health Keywords**: The system checks if your question contains health-related keywords (sleep, exercise, stress, mental health, etc.)
- **Validation**: If your question is not health-related, you'll receive a toast notification asking you to ask health-related questions only
- **System Prompt**: The AI is configured with a system prompt that restricts responses to health topics only

### Features

✅ **DeepSeek R1 B4 Integration**: Uses DeepSeek's chat completion API  
✅ **Health Topic Validation**: Only allows health-related questions  
✅ **Personalized Responses**: Uses your health data (score, sleep, exercise, etc.) for context  
✅ **Fallback Mode**: If API key is not configured, uses rule-based responses  
✅ **Error Handling**: Graceful error handling with user-friendly messages  

### Health Topics Covered

The chatbot can answer questions about:
- Mental health and wellness
- Physical health and fitness
- Sleep patterns and quality
- Exercise and workout routines
- Stress management
- Nutrition and diet
- Medical conditions and symptoms
- Health screenings and checkups
- Recovery and healing
- And other health-related topics

## Troubleshooting

### API Key Not Working

1. Verify your API key is correct in the `.env` file
2. Make sure the `.env` file is in the root directory
3. Restart your development server
4. Check the browser console for error messages

### Questions Being Rejected

If valid health questions are being rejected:
- The keyword list can be expanded in `src/components/chatbot/Chatbot.tsx`
- Look for the `HEALTH_KEYWORDS` array and add more keywords if needed

### Fallback Mode Active

If you see a warning icon (⚠️) next to "AI Health Assistant":
- Your API key is not configured
- The chatbot will use rule-based responses instead of DeepSeek API
- Follow Step 2 above to configure your API key

## Security Notes

- **Never share your API key publicly**
- **Don't commit `.env` files to Git**
- **Use environment variables for API keys in production**
- **Consider using a backend proxy for production** to keep API keys server-side

## Model Information

The integration uses:
- **Model**: `deepseek-chat` (standard chat model)
- **Alternative**: You can change to `deepseek-reasoner` in the code if you have access to the R1 reasoning model
- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`

To use DeepSeek R1 reasoning model, update line in `Chatbot.tsx`:
```typescript
model: 'deepseek-reasoner', // Instead of 'deepseek-chat'
```
