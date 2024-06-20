const OPENAIKEY = "sk-proj-2zBdqcOpfwmNbMLpNblZT3BlbkFJZf2NpUDG8blPJ8IIaLai";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "deleteStorage") {
    deleteStorage(sendResponse);
    return true;
  } else if (request.type === "captureVisibleTab") {
    captureVisibleTab(sendResponse);
    return true;
  } else if (request.type === "sendMessageToGPT") {
    saveMessageToHistory(request.message, "user");
    sendMessageToGPT(request.message, sendResponse);
    return true;
  } else if (request.type === "summarizeImage") {
    summarizeImage(request.image, sendResponse);
    return true;
  } else if (request.type === "getChatHistory") {
    getChatHistoryOnStart(sendResponse);
    return true; // indicates an asynchronous response
  }
});

function summarizeImage(image, sendResponse) {
  console.log(image);
  const systemprompt = `
Please analyze the attached stock price chart and provide an in-depth analysis using the following techniques:

1. **Technical Analysis**:
   - Calculate and plot the 50-day Simple Moving Average (SMA) and Exponential Moving Average (EMA).
   - Compute the Relative Strength Index (RSI).
   - Generate the Moving Average Convergence Divergence (MACD) and signal line.
   - Identify any support and resistance levels.

2. **Pattern Recognition**:
   - Identify any recognizable patterns such as head and shoulders, double tops/bottoms, triangles, or flags.

3. **Statistical Analysis**:
   - Perform linear regression to detect trends.
   - Conduct time series analysis to understand the overall trend.

4. **Machine Learning Models**:
   - Use ARIMA (AutoRegressive Integrated Moving Average) to predict the stock's future price trends for the next 30 days.

Based on your analysis, please summarize the current market trend and provide your prediction for the future trend of the stock price. Additionally, provide a recommendation on whether to buy, sell, or hold the stock.

Note: Please do not include the chart images in the response. Only provide the summarized results and analysis and try to keep the response short and valuable. Give the html formatted response along with the respective html tags to be visible in a browser.
`;

  const messages = [
    {
      role: "system",
      content: systemprompt,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Here's the stock chart I'm interested in. Based on the chart, can you perform a detailed analysis and let me know if it's a good idea to invest in this stock? Please include technical, pattern, and statistical analyses, as well as predictions using machine learning models. Also, I'd appreciate your recommendation on whether to buy, sell, or hold based on your findings.",
        },
        { type: "image_url", image_url: { url: image } },
      ],
    },
  ];

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAIKEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(JSON.stringify(data));
      if (data.choices && data.choices.length > 0) {
        const reply = data.choices[0].message.content;
        console.log("reply: " + reply);
        sendResponse({ message: reply });
        saveMessageToHistory(reply, "assistant");
      } else {
        sendResponse({ message: "Invalid response structure from API." });
      }
    })
    .catch((error) => {
      sendResponse({ message: "API request failed: " + error.message });
    });
}

function captureVisibleTab(sendResponse) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, function (image) {
    if (image) {
      sendResponse({ image: image, message: "Image captured successfully." });
    } else {
      sendResponse({ message: "Failed to capture the image." });
    }
  });
}

function sendMessageToGPT(message, sendResponse) {
  getChatHistory(function (messages) {
    messages = messages.concat([
      {
        role: "user",
        content: message,
      },
    ]);

    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAIKEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.choices && data.choices.length > 0) {
          const reply = data.choices[0].message.content;
          saveMessageToHistory(reply, "assistant");
          sendResponse({ message: reply });
        } else {
          sendResponse({ message: "Invalid response structure from API." });
        }
      })
      .catch((error) => {
        sendResponse({
          message:
            "API request failed: " + error.message + JSON.stringify(messages),
        });
      });
  });
  return true; // This indicates to Chrome that the response will be sent asynchronously.
}

function deleteStorage(sendResponse) {
  chrome.storage.local.clear(() => {
    sendResponse({ message: "Storage cleared successfully." });
  });
}

function getChatHistory(callback) {
  chrome.storage.local.get(["chatHistory"], function (result) {
    const chatHistory = result.chatHistory || [];
    callback(chatHistory);
  });
}

function saveMessageToHistory(text, sender) {
  getChatHistory(function (chatHistory) {
    chatHistory.push({ role: sender, content: text });
    chrome.storage.local.set({ chatHistory: chatHistory });
  });
}

function getChatHistoryOnStart(sendResponse) {
  chrome.storage.local.get(["chatHistory"], function (result) {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to retrieve chat history:",
        chrome.runtime.lastError
      );
      sendResponse({ error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ chatHistory: result.chatHistory || [] });
    }
  });
}
