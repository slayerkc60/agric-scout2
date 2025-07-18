// Core variables
const describeBtn = document.getElementById('describeBtn');
const chatBox = document.getElementById('chatBox');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatHistory = document.getElementById('chatHistory');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');

let chatSessions = {};
let currentChatId = null;

// Show chat when user clicks "Describe"
describeBtn.addEventListener('click', () => {
  chatBox.style.display = 'block';
  describeBtn.style.display = 'none';
});

// Send message logic
sendBtn.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (!message) return;

  // If no chat session, create one
  if (!currentChatId) {
    currentChatId = `chat_${Date.now()}`;
    chatSessions[currentChatId] = {
      title: "Untitled Chat",
      messages: []
    };
    addChatToSidebar(currentChatId, "Untitled Chat");
  }

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.textContent = message;
  chatHistory.appendChild(userMsg);
  chatSessions[currentChatId].messages.push({ sender: 'user', text: message });

  userInput.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Simulate bot reply
  setTimeout(() => {
    const reply = "🌿 Agri-Scout: Thanks! I'm analyzing your symptoms...";
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-msg';
    botMsg.textContent = reply;
    chatHistory.appendChild(botMsg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    chatSessions[currentChatId].messages.push({ sender: 'bot', text: reply });

    // Save to localStorage
localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
localStorage.setItem('currentChatId', currentChatId);

  }, 600);
});

// Enable Enter key to send message
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

// Sidebar toggle
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

const fileInput = document.getElementById('plantPhoto');
const previewBox = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const previewText = previewBox.querySelector('span');

fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];
  if (!file) return;

  // Image preview
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewImage.style.display = 'block';

    const previewText = previewBox.querySelector('span'); // ✅ Add this line
    if (previewText) previewText.style.display = 'none';
  };
  reader.readAsDataURL(file);

  // 🌿 Add image upload message to chat
  if (!currentChatId) {
    currentChatId = `chat_${Date.now()}`;
    chatSessions[currentChatId] = {
      title: "Untitled Chat",
      messages: []
    };
    addChatToSidebar(currentChatId, "Untitled Chat");
  }

  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.textContent = '📷 Photo uploaded and sent for analysis.';
  chatHistory.appendChild(userMsg);
  chatSessions[currentChatId].messages.push({
    sender: 'user',
    type: 'image',
    fileName: file.name,
    timestamp: Date.now()
  });

  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 🧠 Send image to backend
  const formData = new FormData();
  formData.append('photo', file);

  fetch('https://your-backend-api.com/analyze-photo', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg';
      botMsg.textContent = `🌿 Agri-Scout: ${data.analysis || 'Photo analyzed successfully!'}`;
      chatHistory.appendChild(botMsg);
      chatSessions[currentChatId].messages.push({
        sender: 'bot',
        text: data.analysis || 'Photo analyzed successfully!',
        timestamp: Date.now()
      });

      // Save to local storage
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      localStorage.setItem('currentChatId', currentChatId);

      chatHistory.scrollTop = chatHistory.scrollHeight;
    })
    .catch(error => {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg';
      botMsg.textContent = `⚠️ Agri-Scout: Oops! Failed to analyze image.`;
      chatHistory.appendChild(botMsg);
      console.error('Image upload failed:', error);
    });
});


// Function to add a new chat to sidebar
function addChatToSidebar(chatId, title) {
  const chatList = document.getElementById('chatList') || createChatList();
  const listItem = document.createElement('li');
  listItem.setAttribute('data-id', chatId);

  const titleSpan = document.createElement('span');
  titleSpan.className = 'chat-title';
  titleSpan.textContent = title;

  titleSpan.addEventListener('click', () => {
    loadChat(chatId);
  });

  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'chat-options';

  const renameBtn = document.createElement('button');
  renameBtn.textContent = 'Rename';
  renameBtn.onclick = () => {
    const newTitle = prompt('Rename this chat:');
    if (newTitle) {
      titleSpan.textContent = newTitle;
      chatSessions[chatId].title = newTitle;
    }
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Trash';
  deleteBtn.onclick = () => {
    if (confirm('Are you sure you want to delete this chat?')) {
      delete chatSessions[chatId];
      listItem.remove();
      if (chatId === currentChatId) {
        chatHistory.innerHTML = '';
        userInput.value = '';
        currentChatId = null;
      }
    }
    
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
localStorage.setItem('currentChatId', currentChatId);

  };

  optionsDiv.appendChild(renameBtn);
  optionsDiv.appendChild(deleteBtn);
  listItem.appendChild(titleSpan);
  listItem.appendChild(optionsDiv);
  chatList.appendChild(listItem);
}

// Create chat list in sidebar if missing
function createChatList() {
  const chatList = document.createElement('ul');
  chatList.id = 'chatList';
  sidebar.appendChild(chatList);
  return chatList;
}

// Load a chat session into view
function loadChat(chatId) {
  const session = chatSessions[chatId];
  if (session) {
    chatHistory.innerHTML = '';
    session.messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = msg.sender === 'user' ? 'user-msg' : 'bot-msg';
      msgDiv.textContent = msg.text;
      chatHistory.appendChild(msgDiv);
    });
    currentChatId = chatId;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Restore sessions
  const storedSessions = localStorage.getItem('chatSessions');
  const storedCurrent = localStorage.getItem('currentChatId');

  if (storedSessions) {
    chatSessions = JSON.parse(storedSessions);
    Object.entries(chatSessions).forEach(([id, session]) => {
      addChatToSidebar(id, session.title);
    });
  }

  if (storedCurrent && chatSessions[storedCurrent]) {
    currentChatId = storedCurrent;
    loadChat(currentChatId);
  }
});

