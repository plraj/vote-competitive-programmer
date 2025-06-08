
        // Firebase config 
        const firebaseConfig = {
            apiKey: "AIzaSyD7DV7dn66P7ihhwjV375fM2CC5UKDml7A",
            authDomain: "truth-6e833.firebaseapp.com",
            databaseURL: "https://truth-6e833-default-rtdb.firebaseio.com",
            projectId: "truth-6e833",
            storageBucket: "truth-6e833.firebasestorage.app",
            messagingSenderId: "801201675937",
            appId: "1:801201675937:web:dc87597450cab47c715ae0",
            measurementId: "G-9K99B7SZ5P"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        (() => {

            const resetTaskHistoryBtn = document.getElementById("resetTaskHistoryBtn");
            const resetChatHistoryBtn = document.getElementById("resetChatHistoryBtn");

            resetTaskHistoryBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset the task history? This cannot be undone.")) {
                dbRef.transaction(currentData => {
                if (!currentData) return;
                currentData.history = [];
                // Optionally reset currentTask and doneStatus if desired:
                // currentData.currentTask = null;
                // currentData.doneStatus = {};
                return currentData;
                });
            }
            });

            resetChatHistoryBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset all chat history? This cannot be undone.")) {
                const chatRef = db.ref("chat-messages");
                chatRef.set([]);
            }
            });

            // Password map 
            const friendPasswords = {
            1: "friendpass01",
            2: "friend2pass",
            3: "friend3pass",
            4: "friend4pass",
            5: "friend5pass",
            6: "friend6pass"
            };

            const friendsCount = 6;

            const truthTasks = [
            "What’s your most embarrassing moment?",
            "Have you ever cheated on a bf/gf?",
            "What’s a secret you’ve never told anyone?",
            "Who was your first crush?",
            "What’s your biggest fear?"
            ];

            const dareTasks = [
            "Send a funny selfie to the group chat.",
            "Record a 10-second dance video and share it.",
            "Draw a quick portrait of yourself and share a photo.",
            "Send a silly voice message doing your best animal sound.",
            "Post a childhood photo and share a fun memory."
            ];

            // Elements
            const loginSection = document.getElementById("loginSection");
            const gameSection = document.getElementById("gameSection");
            const loginForm = document.getElementById("loginForm");
            const friendIdInput = document.getElementById("friendIdInput");
            const passwordInput = document.getElementById("passwordInput");
            const passwordHelp = document.getElementById("passwordHelp");

            const card = document.getElementById("gameCard");
            const cardHeadline = document.getElementById("cardHeadline");
            const cardSubtext = document.getElementById("cardSubtext");
            const tapBtn = document.getElementById("tapButton");
            const taskDoneBtn = document.getElementById("taskDoneButton");
            const playAgainBtn = document.getElementById("playAgainButton");
            const historyList = document.getElementById("historyList");
            const logoutBtn = document.getElementById("logoutButton");

            // Chat elements
            const openChatButton = document.getElementById("openChatButton");
            const chatPopupOverlay = document.getElementById("chatPopupOverlay");
            const chatCloseButton = document.getElementById("chatCloseButton");
            const chatMessages = document.getElementById("chatMessages");
            const chatInput = document.getElementById("chatInput");
            const chatSendButton = document.getElementById("chatSendButton");

            let loggedInFriendId = null;
            let loggedInFriendName = null;

            // Helpers
            function getRandomInt(max) {
            return Math.floor(Math.random() * max);
            }

            function selectRandomFriend() {
            const ids = [];
            for (let i = 1; i <= friendsCount; i++) {
                ids.push(i);
            }
            return ids[getRandomInt(ids.length)];
            }

            function selectTask(type) {
            if (type === "Truth") {
                return truthTasks[getRandomInt(truthTasks.length)];
            } else {
                return dareTasks[getRandomInt(dareTasks.length)];
            }
            }

            function renderHistoryEntry(entry) {
            const container = document.createElement("div");
            container.classList.add("history-entry");
            container.dataset.friendId = entry.friendId;
            const friendColor = `hsl(${(entry.friendId * 72) % 360}, 70%, 50%)`;
            container.style.borderLeft = `4px solid ${friendColor}`;
            const header = document.createElement("div");
            header.className = "history-header";
            header.textContent = `Friend ${entry.friendId} - ${entry.type} (${new Date(entry.timestamp).toLocaleTimeString()})`;
            const content = document.createElement("div");
            content.className = "history-content";
            content.textContent = entry.task;
            container.appendChild(header);
            container.appendChild(content);
            return container;
            }

            function updateHistoryUI(history) {
            historyList.innerHTML = "";
            history.forEach(entry => {
                historyList.appendChild(renderHistoryEntry(entry));
            });
            }

            function allFriendsDone(doneStatus) {
            if (!doneStatus) return false;
            for (let i = 1; i <= friendsCount; i++) {
                if (!doneStatus[i]) return false;
            }
            return true;
            }

            // Updates main UI based on game state and logged in friend
            function updateUIFromState(state) {
            const userFriendId = loggedInFriendId;
            if (!userFriendId) return;

            if (!state || !state.currentTask) {
                card.dataset.taskActive = "false";
                cardHeadline.textContent = "Tap to select a friend and a task";
                cardSubtext.textContent = "Waiting for your action...";
                tapBtn.style.display = "inline-block";
                tapBtn.disabled = false;
                taskDoneBtn.style.display = "none";
                playAgainBtn.style.display = "none";
                return;
            }

            const { currentTask, doneStatus } = state;
            card.dataset.taskActive = "true";
            cardHeadline.textContent = `Friend ${currentTask.friendId} selected!`;
            cardSubtext.innerHTML = `<div class="task-type">${currentTask.type}</div><div class="task-content">${currentTask.task}</div>`;

            const userDone = doneStatus && doneStatus[userFriendId];
            if (userDone) {
                taskDoneBtn.style.display = "none";
                tapBtn.style.display = "none";
            } else {
                taskDoneBtn.style.display = "inline-block";
                taskDoneBtn.disabled = false;
                tapBtn.style.display = "none";
            }

            if (allFriendsDone(doneStatus)) {
                playAgainBtn.style.display = "inline-block";
                taskDoneBtn.style.display = "none";
                tapBtn.style.display = "none";
            } else {
                playAgainBtn.style.display = "none";
            }
            }

            // Chat message render helper
            function createChatMessageElement(msgData) {
            const container = document.createElement("div");
            container.classList.add("chat-message");
            if (msgData.friendId === loggedInFriendId) {
                container.classList.add("self");
            }
            const sender = document.createElement("div");
            sender.className = 'sender-name';
            sender.textContent = `Friend ${msgData.friendId}`;
            const text = document.createElement("div");
            text.className = 'message-text';
            text.textContent = msgData.message;
            const time = document.createElement("div");
            time.className = 'timestamp';
            time.textContent = new Date(msgData.timestamp).toLocaleTimeString();
            container.appendChild(sender);
            container.appendChild(text);
            container.appendChild(time);
            return container;
            }

            // Update chat messages UI with all messages
            function updateChatMessagesUI(messages) {
            chatMessages.innerHTML = "";
            messages.forEach(msg => {
                chatMessages.appendChild(createChatMessageElement(msg));
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            // Login handler
            loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const selectedId = parseInt(friendIdInput.value, 10);
            const enteredPass = passwordInput.value.trim();

            if (!selectedId) {
                passwordHelp.textContent = "Please select a Friend ID.";
                return;
            }
            if (!enteredPass) {
                passwordHelp.textContent = "Please enter your password.";
                return;
            }

            const correctPass = friendPasswords[selectedId];
            if (enteredPass === correctPass) {
                loggedInFriendId = selectedId;
                passwordHelp.textContent = "";
                friendIdInput.disabled = true;
                passwordInput.value = "";
                loginSection.style.display = "none";
                gameSection.style.display = "flex";
                logoutBtn.style.display = "inline-block";

                // Sync initial UI state for game and chat
                db.ref("truth-or-dare-game").once("value").then(snapshot => {
                updateUIFromState(snapshot.val());
                updateHistoryUI(snapshot.val()?.history || []);
                });
                db.ref("chat-messages").once("value").then(snapshot => {
                updateChatMessagesUI(snapshot.val() || []);
                });
            } else {
                passwordHelp.textContent = "Incorrect password. Please try again.";
            }
            });

            // Logout handler
            logoutBtn.addEventListener("click", () => {
            loggedInFriendId = null;
            passwordHelp.textContent = "";
            friendIdInput.disabled = false;
            loginSection.style.display = "block";
            gameSection.style.display = "none";
            logoutBtn.style.display = "none";
            closeChatPopup();
            chatMessages.innerHTML = "";
            });

            // Firebase DB refs
            const dbRef = db.ref("truth-or-dare-game");
            const chatRef = db.ref("chat-messages");

            // Listen to DB changes (game state)
            dbRef.on("value", snapshot => {
            const state = snapshot.val() || {};
            updateUIFromState(state);
            updateHistoryUI(state.history || []);
            });

            // Listen to chat messages updates
            chatRef.on("value", snapshot => {
            const messages = snapshot.val() || [];
            updateChatMessagesUI(messages);
            });

            // Tap Play button handler - start a new task if none active
            tapBtn.addEventListener("click", () => {
            if (!loggedInFriendId) return;
            dbRef.transaction(currentData => {
                if (currentData && currentData.currentTask) {
                return;
                }
                const selectedFriend = selectRandomFriend();
                const taskType = Math.random() < 0.5 ? "Truth" : "Dare";
                const taskText = selectTask(taskType);

                const newTask = {
                friendId: selectedFriend,
                type: taskType,
                task: taskText,
                timestamp: Date.now()
                };

                if (!currentData) currentData = {history: []};
                currentData.currentTask = newTask;
                currentData.doneStatus = {};
                currentData.history = currentData.history || [];
                currentData.history.unshift(newTask);
                if (currentData.history.length > 20) currentData.history.pop();

                return currentData;
            });
            });

            // Task Done button handler - mark current friend done
            taskDoneBtn.addEventListener("click", () => {
            if (!loggedInFriendId) return;
            dbRef.transaction(currentData => {
                if (!currentData || !currentData.currentTask) return;
                currentData.doneStatus = currentData.doneStatus || {};
                if (currentData.doneStatus[loggedInFriendId]) return;
                currentData.doneStatus[loggedInFriendId] = true;
                return currentData;
            });
            });

            // Play Again button handler - clear current task & doneStatus
            playAgainBtn.addEventListener("click", () => {
            if (!loggedInFriendId) return;
            dbRef.transaction(currentData => {
                if (!currentData) return;
                currentData.currentTask = null;
                currentData.doneStatus = {};
                return currentData;
            });
            });

            // Chat popup logic
            function openChatPopup() {
            chatPopupOverlay.classList.add("active");
            chatInput.focus();
            }
            function closeChatPopup() {
            chatPopupOverlay.classList.remove("active");
            chatInput.value = "";
            chatSendButton.disabled = true;
            }

            openChatButton.addEventListener("click", () => {
            if (gameSection.style.display === "flex") {
                openChatPopup();
            }
            });
            chatCloseButton.addEventListener("click", closeChatPopup);
            chatPopupOverlay.addEventListener("click", (evt) => {
            if (evt.target === chatPopupOverlay) closeChatPopup();
            });

            // Enable send button only when input has text
            chatInput.addEventListener("input", () => {
            chatSendButton.disabled = !chatInput.value.trim();
            });

            // Send chat message
            chatSendButton.addEventListener("click", () => {
            if (!loggedInFriendId) return;
            const messageText = chatInput.value.trim();
            if (!messageText) return;
            const newMessage = {
                friendId: loggedInFriendId,
                message: messageText,
                timestamp: Date.now()
            };
            chatSendButton.disabled = true;

            // Push new message to Firebase
            chatRef.transaction(currentMessages => {
                if (!Array.isArray(currentMessages)) currentMessages = [];
                currentMessages.push(newMessage);
                // Keep chat history to last 100 to limit size
                if (currentMessages.length > 100) currentMessages = currentMessages.slice(currentMessages.length - 100);
                return currentMessages;
            }).then(() => {
                chatInput.value = "";
                chatInput.focus();
            }).catch(() => {
                // On error, re-enable send button
                chatSendButton.disabled = false;
            });
            });

            // Accessibility: allow send on enter key (ctrl+enter for new line)
            chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!chatSendButton.disabled) {
                chatSendButton.click();
                }
            }
            });
        })();

