let handleMemberJoined = async (memberId) => {
  addMemberToDom(memberId);

  let members = await channel.getMembers();
  updateMemeberTotal(members);

  let { name } = await rtmClient.getUserAttributesByKeys(memberId, ["name"]);
  addBotMessageToDom(`${name} just joined the meet! 👋`);
};

let handleMemberLeft = async (memberId) => {
  removeMemberFromDom(memberId);

  let members = await channel.getMembers();
  updateMemeberTotal(members);
};

let getMembersFromChannel = async () => {
  let members = await channel.getMembers();
  updateMemeberTotal(members);
  for (let i = 0; i < members.length; i++) {
    addMemberToDom(members[i]);
  }
};

let handleChannelMessage = async (messageData, memberId) => {
  console.log("new msg came");
  let data = JSON.parse(messageData.text);

  if (data.type === "chat") {
    addMessageToDom(data.displayName, data.message);
  }

  if (data.type === "user_left") {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame === `user-container-${uid}`) {
      displayFrame.style.display = null;

      for (let i = 0; videoFrames.length > i; i++) {
        videoFrames[i].style.height = "300px";
        videoFrames[i].style.width = "300px";
      }
    }
  }
};

let sendMessage = async (e) => {
  e.preventDefault();

  let message = e.target.message.value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
    }),
  });

  addMessageToDom(displayName, message);
  e.target.reset();
};

// __________________________________________________________________________________________________________________

let addMemberToDom = async (memberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(memberId, ["name"]);

  let memberWrapper = document.getElementById("member__list");

  let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`;

  memberWrapper.insertAdjacentHTML("beforeend", memberItem);
};

let updateMemeberTotal = async (members) => {
  let total = document.getElementById("members__count");
  total.innerText = members.length;
};

let removeMemberFromDom = async (memberId) => {
  let memberWrapper = document.getElementById(`member__${memberId}__wrapper`);
  memberWrapper.remove();

  let name = memberWrapper.querySelector(".member_name").innerText;
  addBotMessageToDom(`${name} just left the room! 😔`);
};

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

let addMessageToDom = (name, message) => {
  let messagesWrapper = document.getElementById("messages");

  let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );

  if (lastMessage) {
    lastMessage.scrollIntoView({ behavior: "smooth" });
  }
};

let addBotMessageToDom = (botMessage) => {
  let messagesWrapper = document.getElementById("messages");

  let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Meeses Bot</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`;

  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);

  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );

  if (lastMessage) {
    lastMessage.scrollIntoView({ behavior: "smooth" });
  }
};

// __________________________________________________________________________________________________________________

window.addEventListener("beforeunload", leaveChannel);

let messageForm = document.getElementById("message__form");

messageForm.addEventListener("submit", sendMessage);
