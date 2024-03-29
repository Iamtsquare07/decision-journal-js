document.addEventListener("DOMContentLoaded", function () {
  const decisionDateInput = document.getElementById("decisionDate");
  const submitButton = document.getElementById("smbtn");
  const message = document.getElementById("message");
  const listsContainer = document.getElementById("lists");
  const clearBtn = document.getElementById("clear");
  const resetBtn = document.getElementById("reset");
  const decisionHeader = document.querySelector(".decisionHeader");
  const input = document.getElementById("decision");
  const userSpan = document.getElementById("user");
  let positiveCount = localStorage.getItem("positiveCount") || 0;
  let firstPositveCount = localStorage.getItem("firstPositveCount") || false;
  let thirdPositveCount = localStorage.getItem("thirdPositveCount") || false;
  let user = localStorage.getItem("htuser") || "";
  let userCaptured = localStorage.getItem("userCaptured") || false;
  let editedInterval;

  function resetData() {
    localStorage.removeItem("firstPositveCount");
    localStorage.removeItem("thirdPositveCount");
    localStorage.removeItem("positiveCount");
    localStorage.removeItem("htuser");
    localStorage.removeItem("userCaptured");

    clearList();
  }

  resetBtn.addEventListener("click", resetData);

  input.focus();
  submitButton.addEventListener("click", adddecision);
  document
    .getElementById("decision")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") adddecision();
    });

  // Load decisions from localStorage on page load
  loaddecisionsFromLocalStorage();

  function adddecision() {
    const decisionDate = decisionDateInput.value;
    if (!userCaptured) {
      user = prompt("What is your name? beloved.", "");
      while (user.length < 1) {
        user = prompt("Please provide a valid name", "");
      }
      localStorage.setItem("htuser", user);

      userCaptured = true;
      localStorage.setItem("userCaptured", userCaptured);
      alert(`Welcome to decision Tracker. ${capitalizeFirstLetter(user)}`);
    }

    if (input.value.length === 0 || decisionDate === "") {
      alert("Please enter a decision");
      input.focus();
      return;
    }
    // Parse the selected date and the current date
    const selectedDate = new Date(decisionDate);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0); // Set time part to midnight
    currentDate.setHours(0, 0, 0, 0);

    // Compare the selected date with the current date
    if (selectedDate < currentDate && selectedDate !== currentDate) {
      alert(
        "Oops! It seems like you've discovered the secret to time travel, but our services are strictly for the present and future. Best of luck with your journey to the past! 🕰️🚀😍"
      );
      return;
    }

    clearBtn.style.display = "block";
    resetBtn.style.display = "block";
    if (
      decisionHeader.textContent !==
      `${capitalizeFirstLetter(user)}'s Decision Journal`
    ) {
      decisionHeader.textContent = `${capitalizeFirstLetter(
        user
      )}'s Decision Journal`;
    }

    //customize the content for user
    if (userSpan.textContent.length < 1) {
      userSpan.textContent = ` ${capitalizeFirstLetter(user)}`;
    }

    const decisionText = input.value.trim();
    const decisionState = document.getElementById("state");

    if (
      returnState(decisionState.value) ===
      `<i class="fa-solid fa-face-laugh-beam"></i>`
    ) {
      console.log("Success");
      const congratulations = document.getElementById("congratulations");
      if (!firstPositveCount) {
        firstPositveCount = true;
        localStorage.setItem("firstPositveCount", firstPositveCount);
        congratulations.textContent = `You make your first excellent decision. Congrats ${capitalizeFirstLetter(
          user
        )}`;
        renderCelebrate(congratulations);
      } else if (positiveCount === 3) {
        if (!thirdPositveCount) {
          congratulations.textContent =
            "You make your third excellent decision. You're on fire🔥";
        } else {
          congratulations.textContent = `Somebody call the fire department🔥🔥🔥😲. ${capitalizeFirstLetter(
            user
          )}, that's another hattrick of excellent decisions.`;
        }
        renderCelebrate(congratulations);
        positiveCount = 0;
        thirdPositveCount = true;
        localStorage.setItem("positiveCount", positiveCount);
        localStorage.setItem("thirdPositveCount", thirdPositveCount);
      }

      positiveCount++;
      localStorage.setItem("positiveCount", positiveCount);
    }

    const listItem = createdecisionListItem(
      decisionText,
      returnState(decisionState.value)
    );
    const decisionList = getOrCreatedecisionList(decisionDate); // Get or create the decision list
    decisionList.appendChild(listItem);

    input.value = "";
    decisionDateInput.value = "";
    message.textContent = "Added!";
    setTimeout(() => {
      message.textContent = "";
    }, 1000);

    // Save decisions to localStorage
    savedecisionsToLocalStorage();
    renderDate();
    input.focus();
  }

  function returnState(state) {
    if (state === "Excellent") {
      return `<i class="fa-solid fa-face-laugh-beam"></i>`;
    } else if (state === "Good") {
      return `<i class="fa-solid fa-face-smile-beam"></i>`;
    } else if (state === "Bad") {
      return `<i class="fa-solid fa-face-meh"></i>`;
    } else if (state === "Worst") {
      return `<i class="fa-solid fa-face-sad-tear"></i>`;
    } else {
      return `<i class="fa-regular fa-face-smile"></i>`;
    }
  }

  function renderCelebrate(congratulations) {
    const celebrate = document.getElementById("celebration");
    celebrate.style.display = "block";
    congratulations.classList.add("show");
    setTimeout(() => {
      celebrate.style.display = "none";
      congratulations.classList.remove("show");
    }, 5000);
  }

  function clearList() {
    listsContainer.innerHTML = ""; // Clear all lists
    decisionHeader.textContent = "Add to your decision list";
    clearBtn.style.display = "none";
    resetBtn.style.display = "none";

    // Clear decisions from localStorage
    cleardecisionsFromLocalStorage();
  }

  clearBtn.addEventListener("click", clearList);

  function renderDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    decisionDateInput.value = formattedDate;
  }

  // Call renderDate to set the initial date when the page loads
  renderDate();

  // Get or create a decision list based on the date
  function getOrCreatedecisionList(dateString) {
    const formattedDate = formatDate(dateString);
    const listId = `list-${formattedDate}`;

    // Check if a list with this date already exists
    let decisionList = document.getElementById(listId);

    if (!decisionList) {
      // Create a new list if it doesn't exist
      decisionList = document.createElement("ul");
      decisionList.id = listId;
      decisionList.className = "decisionList";

      // Create a heading for the list with the selected date
      const listHeading = document.createElement("h2");
      listHeading.textContent = formattedDate;
      decisionList.appendChild(listHeading);

      // Append the list to the lists container
      listsContainer.appendChild(decisionList);
    }

    return decisionList;
  }

  // Function to format the date
  function formatDate(dateString) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }

  function createdecisionListItem(decisionText, stateValue) {
    // Create a new decision list item
    const listItem = document.createElement("li");
    listItem.className = "mainList";
    const stateValueElement = document.createElement("span");
    stateValueElement.innerHTML = stateValue;
    stateValueElement.className = "decisionStateValue";

    listItem.innerHTML = `
        <span class="decisionText">${decisionText}</span>
        <button class="editdecision"><i class="fas fa-pen-square"></i> Edit</button>
        <button class="deletedecision"><i class="fas fa-trash-alt"></i></button>
      `;

    listItem.insertBefore(stateValueElement, listItem.firstChild);

    listItem.querySelector(".deletedecision").addEventListener("click", () => {
      listItem.remove();
      // Save decisions to localStorage after deleting a decision
      savedecisionsToLocalStorage();
    });

    listItem.querySelector(".editdecision").addEventListener("click", () => {
      const decisionSpan = listItem.querySelector(".decisionText");
      const editedText = prompt("Edit the decision:", decisionSpan.textContent);
      if (editedText !== null) {
        decisionSpan.textContent = editedText;
        // Save decisions to localStorage after editing a decision
        savedecisionsToLocalStorage();
      }
    });

    listItem
      .querySelector(".decisionStateValue")
      .addEventListener("click", () => {
        const decisionSpan = listItem.querySelector(".decisionStateValue");
        console.log(decisionSpan.innerHTML);
        function checkDecisionState() {
          if (
            decisionSpan.innerHTML ===
            `<i class="fa-solid fa-face-laugh-beam"></i>`
          ) {
            return 1;
          } else if (
            decisionSpan.innerHTML ===
            `<i class="fa-solid fa-face-smile-beam"></i>`
          ) {
            return 2;
          } else if (
            decisionSpan.innerHTML === `<i class="fa-solid fa-face-meh"></i>`
          ) {
            return 3;
          } else if (
            decisionSpan.innerHTML ===
            `<i class="fa-solid fa-face-sad-tear"></i>`
          ) {
            return 4;
          } else {
            return 5;
          }
        }

        function checkDecisionStateValue(editedState) {
          if (Number(editedState) === 1) {
            return `<i class="fa-solid fa-face-laugh-beam"></i>`;
          } else if (Number(editedState) === 2) {
            return `<i class="fa-solid fa-face-smile-beam"></i>`;
          } else if (Number(editedState) === 3) {
            return `<i class="fa-solid fa-face-meh"></i>`;
          } else if (Number(editedState) === 4) {
            return `<i class="fa-solid fa-face-sad-tear"></i>`;
          } else if (editedState.toLowerCase() === "excellent") {
            return `<i class="fa-solid fa-face-laugh-beam"></i>`;
          } else if (editedState.toLowerCase() === "good") {
            return `<i class="fa-solid fa-face-smile-beam"></i>`;
          } else if (editedState.toLowerCase() === "bad") {
            return `<i class="fa-solid fa-face-meh"></i>`;
          } else if (editedState.toLowerCase() === "worst") {
            return `<i class="fa-solid fa-face-sad-tear"></i>`;
          } else {
            alert("Please select a valid choice.");
            return null;
          }
        }

        let isValidInput = false;
        let editedState;

        while (!isValidInput) {
          editedState = prompt(
            "How was the decision? Enter number 1:Excellent 2:Good 3:Bad/ 4:Worst",
            checkDecisionState()
          );

          if (editedState !== null) {
            const result = checkDecisionStateValue(editedState);
            if (result !== null) {
              isValidInput = true;
              decisionSpan.innerHTML = result;
              // Save decisions to localStorage after editing a decision
              savedecisionsToLocalStorage();
            }
          } else {
            isValidInput = true;
          }
        }
      });

    return listItem;
  }

  function loaddecisionsFromLocalStorage() {
    if (localStorage.getItem("lastEdited")) {
      updateLastEdited();
      editedInterval = setInterval(updateLastEdited, 60000);
    }

    const decisions = JSON.parse(localStorage.getItem("decisions")) || {};
    if (Object.keys(decisions).length === 0) {
      return;
    }

    clearBtn.style.display = "block";
    resetBtn.style.display = "block";
    decisionHeader.textContent = `${capitalizeFirstLetter(
      user
    )}'s Decision Journal`;

    for (const dateString in decisions) {
      const decisionList = getOrCreatedecisionList(dateString);
      const decisionsForDate = decisions[dateString];

      for (const decision of decisionsForDate) {
        const formattedDate = new Date(dateString);
        const listItem = createdecisionListItem(decision.text, decision.state);
        decisionList.appendChild(listItem);
      }
    }

    if (userSpan.textContent.length < 1) {
      userSpan.textContent = ` ${capitalizeFirstLetter(user)}`;
    }
  }

  function savedecisionsToLocalStorage() {
    const decisions = {};
    const decisionLists = listsContainer.querySelectorAll(".decisionList");

    for (const decisionList of decisionLists) {
      const formattedDate = decisionList.querySelector("h2").textContent;
      const dateString = formatDateForLocalStorage(new Date(formattedDate));

      const decisionsForDate = [];
      const listItems = decisionList.querySelectorAll("li");

      for (const listItem of listItems) {
        const decisionText =
          listItem.querySelector(".decisionText").textContent;
        const decisionState = listItem.querySelector(
          ".decisionStateValue"
        ).innerHTML;

        decisionsForDate.push({ text: decisionText, state: decisionState });
      }

      decisions[dateString] = decisionsForDate;
    }

    localStorage.setItem("decisions", JSON.stringify(decisions));

    // Check if all dates have no values
    let allDatesEmpty = true;
    console.log(decisions);

    const allDates = Object.keys(decisions);

    for (const dateKey of allDates) {
      const dateValues = decisions[dateKey];

      if (dateValues && dateValues.length > 0) {
        allDatesEmpty = false;
        break;
      }
    }

    if (allDatesEmpty) {
      clearList();
    }
  }

  function formatDateForLocalStorage(dateString) {
    const date = new Date(dateString);
    return date.toISOString(); // Use ISO format
  }

  function cleardecisionsFromLocalStorage() {
    localStorage.removeItem("decisions");
  }
});

function capitalizeFirstLetter(text) {
  // Split the string into words
  const words = text.split(" ");

  // Capitalize the first letter of each word
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the capitalized words back together
  return capitalizedWords.join(" ");
}

function submitSurvey() {
  // Get form values
  const goingWell = document.getElementById("goingWell").value;
  const notGoingWell = document.getElementById("notGoingWell").value;
  const lessonsLearned = document.getElementById("lessonsLearned").value;
  const coreValues = document.getElementById("coreValues").value;
  const integrity = document.getElementById("integrity").value;
  const higherStandard = document.getElementById("higherStandard").value;

  // Perform basic validation
  if (
    !goingWell ||
    !notGoingWell ||
    !lessonsLearned ||
    !coreValues ||
    !integrity ||
    !higherStandard
  ) {
    alert(
      `Please fill out all the fields before submitting the survey. You can enter 'No comments' on fields you don't have an answer for yet.`
    );
    return; // Exit the function if validation fails
  }

  // Create survey data object
  const surveyData = {
    goingWell,
    notGoingWell,
    lessonsLearned,
    coreValues,
    integrity,
    higherStandard,
  };

  // Save survey data to localStorage
  localStorage.setItem("yearEndSurvey", JSON.stringify(surveyData));

  // Display success message
  alert("Survey submitted successfully!");

  // Reset the form
  document.getElementById("surveyForm").reset();
  localStorage.setItem("lastEdited", getCurrentDate());
  updateLastEdited();
}

function displaySavedResponses() {
  const savedResponses = localStorage.getItem("yearEndSurvey");
  const responseDisplay = document.getElementById("responseDisplay");

  if (savedResponses) {
    const surveyData = JSON.parse(savedResponses);

    let html = `<h3>Your Responses:</h3>`;
    for (const key in surveyData) {
      html += `<p><strong>${processSurveyKeys(key)}:</strong> ${
        surveyData[key]
      }</p>`;
    }

    html += `<button onclick="editResponses()">Edit Responses</button><br/>
    <p id="log-messages"></p>`;
    responseDisplay.innerHTML = html;
  } else {
    responseDisplay.innerHTML = "<p>No saved surveys yet.</p>";
  }
}

function processSurveyKeys(key) {
  if (key === "goingWell") {
    return "Things Going Well";
  } else if (key === "notGoingWell") {
    return "Things Not Going Well";
  } else if (key === "lessonsLearned") {
    return "Lesson You've Learned";
  } else if (key === "coreValues") {
    return "Your Core Values";
  } else if (key === "integrity") {
    return "Your Integrity";
  } else if (key === "higherStandard") {
    return "Your Higher Standards";
  }
}

function editResponses() {
  const savedResponses = localStorage.getItem("yearEndSurvey");
  const surveyData = JSON.parse(savedResponses);

  for (const key in surveyData) {
    const textarea = document.getElementById(key);
    if (textarea) {
      textarea.value = surveyData[key];
    }
  }

  const messagesLogs = document.getElementById("log-messages");

  messagesLogs.innerText =
    "Your responses were successfully loaded into the text fields. You can now edit.";

  updateLastEdited();

  document.getElementById("goingWell").focus();

  editedInterval = setInterval(updateLastEdited, 60000);
}

function formatTime(minutes) {
  if (minutes === 1) {
    return "1 minute ago";
  } else {
    return `${minutes} minutes ago`;
  }
}

function formatTimeDifference(minutes) {
  if (minutes === 1) {
    return "1 minute ago";
  } else {
    return `${minutes} minutes ago`;
  }
}

function updateLastEdited() {
  const messagesLogs = document.getElementById("log-messages");
  const lastEditedString = localStorage.getItem("lastEdited");

  if (!lastEditedString) {
    const currentTime = new Date();
    localStorage.setItem("lastEdited", currentTime.toISOString());
    const formattedDate = formatDateToDateString(currentTime);
    if (messagesLogs) messagesLogs.innerText = `Last edited: ${formattedDate}`;
    return;
  }

  const lastEdited = new Date(lastEditedString);
  const currentTime = new Date();
  const timeDifference = Math.floor((currentTime - lastEdited) / (60 * 1000));
  const minutesDifference = timeDifference % 60;

  if (timeDifference < 59) {
    const formattedTime = formatTimeDifference(minutesDifference);
    messagesLogs.innerText = `Last edited: ${formattedTime}`;
  } else {
    const formattedDate = formatDateToDateString(lastEdited);
    messagesLogs.innerText = `Last edited: ${formattedDate}`;
  }
}

function formatDateToDateString(inputDate) {
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
  const day = inputDate.getDate().toString().padStart(2, "0");
  const year = inputDate.getFullYear();

  return `${month}/${day}/${year}`;
}

function getCurrentDate() {
  const currentDate = new Date();
  return `${currentDate}`;
}

displaySavedResponses();
