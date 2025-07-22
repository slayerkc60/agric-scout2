document.addEventListener("DOMContentLoaded", () => {
  const plantPhotoInput = document.getElementById("plantPhoto");
  const previewImage = document.getElementById("previewImage");
  const imagePreview = document.getElementById("imagePreview");
  const describeBtn = document.getElementById("describeBtn");
  const chatBox = document.getElementById("chatBox");
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatHistory = document.getElementById("chatHistory");

  let isAnalyzeMode = false;

  // Handle photo upload
  plantPhotoInput?.addEventListener("change", async () => {
    const file = plantPhotoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImage.style.display = "block";
        imagePreview.querySelector("span").style.display = "none";
      };
      reader.readAsDataURL(file);

      await analyzeUploadedImage(file);
    }
  });

  // Handle describe button click
  describeBtn?.addEventListener("click", () => {
    isAnalyzeMode = true;
    chatBox.style.display = "block";
    userInput.placeholder = "Describe your plant's symptoms...";
    appendMessage("Agri-Scout", "Please describe your plant's symptoms in detail.");
  });

  // Handle send button click
  sendBtn?.addEventListener("click", sendMessage);
  userInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Analyze uploaded image
  async function analyzeUploadedImage(file) {
    try {
      chatBox.style.display = "block";
      appendMessage("Agri-Scout", "Analyzing your plant photo...");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("https://scout-m4ru.onrender.com/ai/analyse", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze image");
      }

      const data = await response.json();
      appendMessage("Agri-Scout", data.prediction || "Analysis complete. Please describe further symptoms if any.");
    } catch (error) {
      console.error("Image analysis error:", error);
      appendMessage("Agri-Scout", "Sorry, I couldn't analyze the image. Try again or describe symptoms manually.");
    }
  }

  // Send message (either analyze or ask)
  async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;

    appendMessage("You", userText);
    userInput.value = "";

    try {
      let url, body, headers;

      if (isAnalyzeMode) {
        // Analyze symptoms (if you had a text-based analysis endpoint)
        // Currently, your /analyse is for images, so fallback to general Q&A
        url = "https://scout-m4ru.onrender.com/ai/ask";
        body = new URLSearchParams({ question: userText });
        headers = { "Content-Type": "application/x-www-form-urlencoded" };
      } else {
        // General questions
        url = "https://scout-m4ru.onrender.com/ai/ask";
        body = new URLSearchParams({ question: userText });
        headers = { "Content-Type": "application/x-www-form-urlencoded" };
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "API request failed");
      }

      const data = await response.json();
      const botResponse = data.answer || "I couldn't process your request properly.";
      appendMessage("Agri-Scout", botResponse);
    } catch (error) {
      console.error("API error:", error);
      appendMessage("Agri-Scout", "Sorry, something went wrong. Check your connection and try again.");
    }
  }

  // Append message to chat
  function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "You" ? "user-msg" : "bot-msg");
    msgDiv.textContent = `${sender}: ${message}`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Add general question button
  const askBtn = document.createElement("button");
  askBtn.textContent = "💬 Ask General Questions";
  askBtn.style.cssText = `
    background: linear-gradient(135deg, #764ba2, #667eea);
    color: white;
    border: none;
    padding: 15px 25px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 10px;
    width: 100%;
    transition: transform 0.2s;
  `;
  askBtn.onmouseover = () => askBtn.style.transform = "translateY(-2px)";
  askBtn.onmouseout = () => askBtn.style.transform = "translateY(0)";
  askBtn.addEventListener("click", () => {
    isAnalyzeMode = false;
    chatBox.style.display = "block";
    userInput.placeholder = "Ask me anything about farming or plants...";
    appendMessage("Agri-Scout", "I'm here to help with your farming questions!");
  });

  describeBtn?.parentNode.insertBefore(askBtn, describeBtn.nextSibling);
});
