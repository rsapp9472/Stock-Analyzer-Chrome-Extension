document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.sendMessage({ type: "getChatHistory" }, (response) => {
    //alert('Chat History Response:', JSON.stringify(response));  // Debugging line to check what's being received
    if (response && response.chatHistory) {
      response.chatHistory.forEach((entry) => {
        displayMessage(entry.content, entry.role);
      });
    } else {
      console.error(
        "No chat history available or error occurred:",
        JSON.stringify(response)
      );
    }
  });
});

document.getElementById("deleteStorage").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "deleteStorage" }, (response) => {
    if (response.message === "Storage cleared successfully.") {
      clearChat();
    }
  });
});

document.getElementById("capture").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "captureVisibleTab" }, (response) => {
    if (response.image) {
      displayImage(response.image);
      displayMessage(response.message, "gpt");
      // Request image analysis after displaying the image
      chrome.runtime.sendMessage(
        { type: "summarizeImage", image: response.image },
        (analysisResponse) => {
          if (analysisResponse && analysisResponse.message) {
            displayMessage(analysisResponse.message, "assistant");
          } else {
            displayMessage("Failed to analyze image", "system");
          }
        }
      );
    } else {
      displayMessage("Failed to capture image", "system");
    }
  });
});

document.getElementById("sendMessage").addEventListener("click", () => {
  sendMessage();
});

document
  .getElementById("userMessage")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      sendMessage();
    }
  });

function clearChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = ""; // Clear the chat display
}

function sendMessage() {
  const userMessage = document.getElementById("userMessage").value;
  if (userMessage.trim() !== "") {
    displayMessage(userMessage, "user"); // Display user message in chat
    chrome.runtime.sendMessage(
      { type: "sendMessageToGPT", message: userMessage },
      (response) => {
        if (response && response.message) {
          displayMessage(response.message, "assistant");
        } else {
          displayMessage("Failed to process your message", "assistant");
        }
      }
    );
    document.getElementById("userMessage").value = ""; // Clear the input field
  }
}

function displayMessage(message, sender) {
  const chat = document.getElementById("chat");
  const messageContainer = document.createElement("div");
  messageContainer.className = `message ${sender}`;

  //alert("Inside displayMessage. message: " + message + " sender: " + sender);
  if (sender === "assistant") {
    message = formatApiResponse(message);
    //alert("After formatApiResponse. message: " + message);
    messageContainer.innerHTML = message;

    // Apply styles directly if necessary
    messageContainer
      .querySelectorAll("h3")
      .forEach((el) => (el.style.color = "#333"));
    messageContainer
      .querySelectorAll("ul")
      .forEach((el) => (el.style.paddingLeft = "20px"));
    messageContainer
      .querySelectorAll("li")
      .forEach((el) => (el.style.marginBottom = "5px"));
  } else {
    messageContainer.textContent = message; // For text-only messages
  }

  chat.appendChild(messageContainer);
  chat.scrollTop = chat.scrollHeight;
}

function formatApiResponse(message) {
  //alert("Inside formatApiResponse. message: " + message);
  // Convert markdown-like headers
  message = message.replace(/###\s(.+)/g, "<h3>$1</h3>");

  // Convert markdown-like bold syntax
  message = message.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert list items
  message = message.replace(/-\s(.+)/g, "<li>$1</li>");
  message = message.replace(/(<li>.+?<\/li>)/g, "<ul>$1</ul>");

  return message;
}

function displayImage(imageUrl) {
  const chat = document.getElementById("chat");
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.maxWidth = "100%";
  chat.appendChild(img);
}
