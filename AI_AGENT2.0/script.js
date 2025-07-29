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

        await analyzeUploadedImage(file);
      }
    });
  }

  if (describeBtn) {
     describeBtn.style.display = "none";
    describeBtn.addEventListener("click", () => {
      isAnalyzeMode = true;
      chatBox.style.display = "block";
      userInput.placeholder = "Describe your plant's symptoms (e.g., yellow leaves, brown spots, wilting)...";
      appendMessage("Agri-Scout", "Please describe your plant's symptoms in detail. I'll help you identify what might be wrong!");
    });
  }

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  async function analyzeUploadedImage(file) {
    try {
      chatBox.style.display = "block";
      isAnalyzeMode = true;
      appendMessage("Agri-Scout",  '<img src = "circles-menu-3" alt ="loading" width= "30">');

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
      console.log("✅ Image API response:", data);

      const botResponse = extractBotResponse(data, "prediction");
      appendMessage("Agri-Scout", botResponse);

    } catch (error) {
      console.error(" Image analysis error:", error);
      appendMessage("Agri-Scout", "Sorry, I couldn't analyze the image. Please try uploading again or describe the symptoms manually.");
    }
  }

  async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === "") return;

    appendMessage("You", userText);
    userInput.value = "";
    
    appendMessage ("Agric-scout" , '<img src = "circles-menu-3" alt ="loading" width= "30">');
    const loadingmsg = chatHistory.lastChild;

    try {
      let response;
      let botResponse;

      if (isAnalyzeMode) {
        const formData = new URLSearchParams();
        formData.append("symptoms", userText);

        response = await fetch("https://scout-m4ru.onrender.com/ai/ask", {
          method: "POST",
          headers: {
           "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });
      } else {
        const formData = new URLSearchParams();
        formData.append("question", userText);

        response = await fetch("https://scout-m4ru.onrender.com/ai/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.detail || "API request failed");
      }

      const data = await response.json();
      console.log("✅ Text API response:", data);

      botResponse = isAnalyzeMode ? extractBotResponse(data, "prediction") : extractBotResponse(data, "answer");
      appendMessage("Agri-Scout", botResponse);

    } catch (error) {
      console.error("❌ API error:", error);
      appendMessage("Agri-Scout", "Sorry, something went wrong. Please check your connection and try again.");
    }
  }

  function extractBotResponse(data, field) {
    try {
      if (data[field] && data[field].choices && data[field].choices[0].message.content) {
        return data[field].choices[0].message.content;
      }
      return "I couldn't process your request properly.";
    } catch {
      return "Unexpected response format.";
    }
  }

  const askBtn = document.createElement("button");
  askBtn.textContent = "💬 Ask Questions About Your Plants";
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

  if (describeBtn && describeBtn.parentNode) {
    describeBtn.parentNode.insertBefore(askBtn, describeBtn.nextSibling);
  }

  function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "You" ? "user-msg" : "bot-msg");
    msgDiv.textContent = `${sender}: ${message}`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});
