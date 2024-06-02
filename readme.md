# chat4o-stock-analyzer Chrome Extension

## Project Overview

`chat4o-stock-analyzer` is a Chrome extension designed to enhance the experience of stock market enthusiasts and investors by providing real-time, AI-driven analysis of stock charts directly within the browser. Powered by OpenAI's GPT-4 Omni, this tool integrates cutting-edge AI to interpret stock data visually and textually, offering insights and predictions that can help users make informed investment decisions.

## Features

- **Stock Chart Capture**: Instantly capture any stock chart displayed in your browser.
- **AI-Powered Analysis**: Utilize GPT-4 Omni to analyze and interpret the captured stock chart images, providing detailed breakdowns and predictions.
- **Interactive Chat Feature**: Communicate directly with the AI to ask specific questions about stock trends and receive tailored advice.

## How It Works

The extension uses a combination of HTML, CSS, and JavaScript to create a user-friendly interface, with backend scripts handling API requests to OpenAI's GPT-4 Omni model. Here’s a brief rundown of its functionality:

- The user clicks the extension icon and then the 'Capture' button to take a snapshot of the current tab.
- The image is sent to GPT-4 Omni, which returns a comprehensive analysis of the chart.
- Users can also type queries related to the chart directly into the extension's chat feature for more interactive analysis.

## Installation and Setup

To get started with `chat4o-stock-analyzer`, follow these steps:

1. **Clone the Repository**:
   ```git clone https://github.com/yourusername/chat4o-stock-analyzer.git```
2. **Navigate to the Extension Directory**:
   ```cd chat4o-stock-analyzer```
3. **Load the Extension into Chrome**:
   - Open Chrome and navigate to chrome://extensions/
   - Enable Developer Mode by toggling the switch at the top-right.
   - Click on 'Load unpacked' and select the chat4o-stock-analyzer directory.

## Usage

After loading the extension:

Navigate to any webpage containing a stock chart.
Click the extension icon and then the 'Capture' button to analyze the chart.
View the AI-generated analysis in the popup window or ask specific questions through the chat interface.

## Important: OpenAI API Key Requirement

To use this extension, an OpenAI API key is required. Follow these steps to configure your API key securely:

1. Obtain an API key from OpenAI by creating an account at https://beta.openai.com/signup/.
2. Create a .env file in the root of your project directory and add your API key
   ```OPENAI_API_KEY='your_openai_api_key_here'```

3. Update background.js to read the API key from the .env file. Ensure this file is included in your .gitignore to prevent it from being pushed to remote repositories:
   ```const OPENAI_API_KEY = process.env.OPENAI_API_KEY;```

## Security Notice

Do not commit or push your .env file or any files containing your API key to public repositories to avoid unauthorized use of your API key.
