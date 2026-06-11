---chatboth----
<button id="cyber-chat-toggle" onclick="toggleCyberChat()" style="position: fixed; bottom: 20px; right: 20px; background: #0d1117; color: #00d2ff; border: 1px solid #00d2ff; border-radius: 4px; width: 50px; height: 50px; font-size: 20px; cursor: pointer; box-shadow: 0 0 10px rgba(0, 210, 255, 0.2); font-family: 'Orbitron', sans-serif; z-index: 99999; display: flex; align-items: center; justify-content: center; outline: none; transition: all 0.3s;">
    🤖
</button>

<div id="cyber-chat-window" style="display: none; position: fixed; bottom: 85px; right: 20px; width: 320px; height: 420px; background: #0d1117; border: 1px solid #00d2ff; border-radius: 4px; box-shadow: 0 0 20px rgba(0, 210, 255, 0.15); font-family: 'Space Mono', monospace; flex-direction: column; overflow: hidden; z-index: 99999;">
    
    <!-- Chat Header -->
    <div style="background: rgba(0, 210, 255, 0.05); border-bottom: 1px solid rgba(0, 210, 255, 0.2); padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #00ff66; font-size: 10px;">●</span>
            <span style="color: #00d2ff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 0.75rem; letter-spacing: 2px;">SECURITY_BOT v1.0</span>
        </div>
        <button onclick="toggleCyberChat()" style="background: none; border: none; color: #ff0055; font-size: 16px; cursor: pointer; font-weight: bold; outline: none;">[X]</button>
    </div>

    <!-- Chat Logs Area -->
    <div id="chat-logs" style="flex: 1; padding: 15px; overflow-y: auto; background: #070a0f; display: flex; flex-direction: column; gap: 12px; font-size: 0.75rem; line-height: 1.6;">
        <!-- System Initialization Message -->
        <div style="color: #00ff66; background: rgba(0, 255, 102, 0.05); border-left: 2px solid #00ff66; padding: 6px 10px; align-self: flex-start; max-width: 85%;">
            [SYSTEM]: Shell interface operational. Send query to scan threats or view active modules.
        </div>
    </div>

    <!-- Chat Input Area -->
    <div style="padding: 10px; background: #0d1117; border-top: 1px solid rgba(0, 210, 255, 0.2); display: flex; gap: 8px;">
        <input type="text" id="user-input" placeholder="Type a message..." style="flex: 1; background: #070a0f; color: #ffffff; border: 1px solid rgba(0, 210, 255, 0.4); padding: 8px 12px; outline: none; font-family: 'Space Mono', monospace; font-size: 0.75rem; border-radius: 4px;">
        <button onclick="sendMessage()" style="background: #00d2ff; color: #0d1117; border: none; padding: 0 15px; font-weight: bold; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px;">
            Send
        </button>
    </div>
</div>
`;

// Append the chatbot HTML right before the end of body tag
document.body.insertAdjacentHTML('beforeend', chatbotHTML);

// UI Toggle Logic
function toggleCyberChat() {
    var chatWindow = document.getElementById("cyber-chat-window");
    var toggleBtn = document.getElementById("cyber-chat-toggle");
    if (chatWindow.style.display === "none" || chatWindow.style.display === "") {
        chatWindow.style.display = "flex";
        toggleBtn.innerText = "✖";
    } else {
        chatWindow.style.display = "none";
        toggleBtn.innerText = "🤖";
    }
}

// Bot Conversational Logic
function sendMessage() {
    var inputField = document.getElementById("user-input");
    var messageText = inputField.value.trim();
    if (messageText !== "") {
        var logArea = document.getElementById("chat-logs");
        
        // Render User Message
        var userLog = document.createElement("div");
        userLog.innerText = "> " + messageText;
        userLog.style.cssText = "color: #ffffff; background: rgba(255, 255, 255, 0.03); padding: 6px 10px; align-self: flex-end; max-width: 85%; border-right: 2px solid #ffffff; word-wrap: break-word; text-align: right; font-size: 0.75rem; border-radius: 4px;";
        logArea.appendChild(userLog);
        
        inputField.value = "";
        logArea.scrollTop = logArea.scrollHeight;

        // Automated Response Simulation
        setTimeout(function() {
            var botLog = document.createElement("div");
            var lowerText = messageText.toLowerCase();
            
            if (lowerText.includes("hello") || lowerText.includes("hi")) {
                botLog.innerText = "[BOT]: Connection validated. Welcome back to the arena command deck.";
            } else if (lowerText.includes("malware") || lowerText.includes("hack") || lowerText.includes("execution")) {
                botLog.innerText = "[BOT]: Alert: Ensure active dangerous assets run completely containerized within sandboxed nodes.";
            } else if (lowerText.includes("ip") || lowerText.includes("mac")) {
                botLog.innerText = "[BOT]: Initializing address verification... Routing patterns locked down and secure.";
            } else {
                botLog.innerText = "[BOT]: Parameter logged. Command processed under default clearance.";
            }
            
            botLog.style.cssText = "color: #00d2ff; background: rgba(0, 210, 255, 0.05); padding: 6px 10px; align-self: flex-start; max-width: 85%; border-left: 2px solid #00d2ff; word-wrap: break-word; font-size: 0.75rem; border-radius: 4px;";
            logArea.appendChild(botLog);
            logArea.scrollTop = logArea.scrollHeight;
        }, 800);
    }
}

// Setup Event Listeners after DOM loads
document.addEventListener("DOMContentLoaded", function() {
    const inputEl = document.getElementById("user-input");
    if(inputEl) {
        inputEl.addEventListener("keypress", function(event) {
            if (event.key === "Enter") { sendMessage(); }
        });
    }
});
