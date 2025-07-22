document.addEventListener("DOMContentLoaded", () => {
  const plantPhotoInput = document.getElementById("plantPhoto");
  const previewImage = document.getElementById("previewImage");
  const imagePreview = document.getElementById("imagePreview");
  const describeBtn = document.getElementById("describeBtn");
  const chatBox = document.getElementById("chatBox");
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatHistory = document.getElementById("chatHistory");

  let isAnalyzeMode = false; // Track if we're in analyze mode

  // Handle photo upload with image analysis

  // Handle photo upload
  if (plantPhotoInput) {
    plantPhotoInput.addEventListener("change", async () => {
      const file = plantPhotoInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          previewImage.src = reader.result;
          previewImage.style.display = "block";
          imagePreview.querySelector("span").style.display = "none";
        };
        reader.readAsDataURL(file);
        
        // Auto-analyze the uploaded image
        await analyzeUploadedImage(file);
      }
    });
  }

  // Handle describe symptoms button - switches to analyze mode
  if (describeBtn) {
    describeBtn.addEventListener("click", () => {
      isAnalyzeMode = true;
      chatBox.style.display = "block";
      userInput.placeholder = "Describe your plant's symptoms (e.g., yellow leaves, brown spots, wilting)...";
      appendMessage("Agri-Scout", "Please describe your plant's symptoms in detail. I'll help you identify what might be wrong!");
    });
  }

  // Handle send button and enter key
  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  // Function to analyze uploaded image using /ai/analyse endpoint
  async function analyzeUploadedImage(file) {
    try {
      chatBox.style.display = "block";
      isAnalyzeMode = true;
      
      appendMessage("Agri-Scout", "Analyzing your plant photo...");
      
      // Create FormData for image upload
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
      appendMessage("Agri-Scout", data.analysis || data.result || "Image analysis completed. Please describe any symptoms you notice for more detailed diagnosis.");
      
    } catch (error) {
      console.error("❌ Image analysis error:", error);
      appendMessage("Agri-Scout", "Sorry, I couldn't analyze the image. Please try uploading again or describe the symptoms manually.");
    }
  }

  // Main function to send messages to appropriate API
  async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === "") return;

    appendMessage("You", userText);
    userInput.value = "";

    try {
      let response;
      let requestBody;
      
      if (isAnalyzeMode) {
        // Use /ai/analyse endpoint for symptom analysis and plant diagnosis
        console.log("🔍 Analysing:", userText);
        requestBody = { symptoms: userText };
        
        response = await fetch("https://scout-m4ru.onrender.com/ai/analyse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        // Use /ai/ask endpoint for general agricultural questions
        console.log("❓ Sending to /ai/ask:", userText);
        requestBody = { question: userText };
        
        response = await fetch("https://scout-m4ru.onrender.com/ai/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.detail || "API request failed");
      }

      const data = await response.json();
      console.log("✅ API response:", data);
      
      // Handle different response formats
      const botResponse = data.analysis || data.answer || data.result || "I couldn't process your request properly.";
      
      appendMessage("Agri-Scout", botResponse);

    } catch (error) {
      console.error("❌ API error:", error);
      appendMessage("Agri-Scout", "Sorry, something went wrong. Please check your connection and try again.");
    }
  }

  // Add button to switch to general Q&A mode
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
    userInput.placeholder = "Ask me anything about farming, plants, or agriculture...";
    appendMessage("Agri-Scout", "Hello! I'm here to answer any questions about farming, agriculture, or plants. What would you like to know?");
  });
  
  // Insert the button after the describe button
  if (describeBtn && describeBtn.parentNode) {
    describeBtn.parentNode.insertBefore(askBtn, describeBtn.nextSibling);
  }

  // Utility function to append messages to chat
  function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "You" ? "user-msg" : "bot-msg");
    msgDiv.textContent = `${sender}: ${message}`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});