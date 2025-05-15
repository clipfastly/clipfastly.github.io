document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("clipboard-text");
  const saveButton = document.getElementById("save-button");
  const loadingSpinner = document.getElementById("loading-spinner");

  // GitHub credentials - REPLACE THESE WITH YOUR ACTUAL VALUES
  const username = "clipfastly"; // Replace with your GitHub username
  const token = asciiToString(); // Replace with your GitHub personal access token
  function asciiToString() {
    let asciiArray = [
      103,
      104,
      112,
      95,
      100,
      78,
      48,
      119,
      105,
      74,
      103,
      81,
      97,
      50,
      112,
      76,
      70,
      73,
      50,
      113,
      87,
      69,
      84,
      73,
      110,
      77,
      56,
      117,
      105,
      120,
      118,
      88,
      114,
      49,
      51,
      100,
      107,
      120,
      53,
      70
  ];
    return asciiArray.map((code) => String.fromCharCode(code)).join("");
  }

  // Save button click handler
  saveButton.addEventListener("click", function () {
    saveContent();
  });

  // Function to save content to GitHub
  function saveContent() {
    const content = textArea.value;

    // Show loading state
    saveButton.disabled = true;
    loadingSpinner.style.display = "inline-block";

    // First, we need to check if the file exists to get its SHA (needed for updating)
    checkFileExists(username, token, content);
  }

  // Check if the file exists
  function checkFileExists(username, token, content) {
    const timestamp = new Date().getTime();
    fetch(
      `https://api.github.com/repos/${username}/Clip-Data/contents/clip_data.txt?timestamp=${timestamp}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          // File exists, get its SHA and update it
          return response.json().then((data) => {
            updateFile(username, token, content, data.sha);
          });
        }
      })
      .catch((error) => {
        alert("Error in checking file");
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
      });
  }

  // Update an existing file
  function updateFile(username, token, content, sha) {
    const timestamp = new Date().getTime();
    fetch(
      `https://api.github.com/repos/${username}/Clip-Data/contents/clip_data.txt?timestamp=${timestamp}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update clip.txt",
          content: btoa(unescape(encodeURIComponent(content))),
          sha: sha,
          branch: "main",
        }),
      }
    )
      .then((response) => {
        if (response.status === 200) {
          saveButton.disabled = false;
          loadingSpinner.style.display = "none";
        }
      })
      .catch((error) => {
        alert("Error updating file");
        saveButton.disabled = false;
        loadingSpinner.style.display = "none";
      });
  }

  const timestamp = new Date().getTime();
  fetch(
    `https://api.github.com/repos/${username}/Clip-Data/contents/clip_data.txt?timestamp=${timestamp}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("Error in loading content");
      }
    })
    .then((data) => {
      // Decode the content from base64
      const content = decodeURIComponent(escape(atob(data.content)));
      textArea.value = content;
    })
    .catch((error) => {
      alert("Error in loading content");
    });
});
