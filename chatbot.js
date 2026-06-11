// chatboth-cybersecurity
const chatbotHTML = `
<button id="cyber-chat-toggle" onclick="toggleCyberChat()" style="position: fixed; bottom: 20px; right: 20px; background: #0d1117; color: #00d2ff; border: 1px solid #00d2ff; border-radius: 4px; width: 50px; height: 50px; font-size: 20px; cursor: pointer; box-shadow: 0 0 10px rgba(0, 210, 255, 0.2); font-family: 'Orbitron', sans-serif; z-index: 99999; display: flex; align-items: center; justify-content: center; outline: none; transition: all 0.3s;">
    💬
</button>

<div id="cyber-chat-window" style="display: none; position: fixed; bottom: 85px; right: 20px; width: 350px; height: 480px; background: #0d1117; border: 1px solid #00d2ff; border-radius: 4px; box-shadow: 0 0 20px rgba(0, 210, 255, 0.15); font-family: 'Space Mono', monospace; flex-direction: column; overflow: hidden; z-index: 99999;">
    
    <div style="background: rgba(0, 210, 255, 0.05); border-bottom: 1px solid rgba(0, 210, 255, 0.2); padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #00ff66; font-size: 10px;">●</span>
            <span style="color: #00d2ff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 0.75rem; letter-spacing: 2px;">HACKER_ROOM v3.0</span>
        </div>
        <button onclick="toggleCyberChat()" style="background: none; border: none; color: #ff0055; font-size: 16px; cursor: pointer; font-weight: bold; outline: none;">[X]</button>
    </div>

    <iframe src="https://www3.minnit.chat/MalwareLabChat?embed&&nickname=" 
            style="border:none; width:100%; height:100%; flex: 1; background: #0d1117;" 
            allow="geolocation; microphone; camera; display-capture">
    </iframe>
    
</div>
`;

// Append chat components right into the body of whatever page links it
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
        toggleBtn.innerText = "💬";
    }
}
