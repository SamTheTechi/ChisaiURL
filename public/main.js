const input = document.querySelector("input");
const form = document.querySelector("form");
const output = document.querySelector(".output")
const clipboard = document.querySelector(".clipboard");
const origin = window.location.origin;


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalUrl = input.value;
  if (!originalUrl) {
    return alert("Please enter a valid URL!");
  }

  try {
    const response = await fetch(`${origin}/chisai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Server error:", text);
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    input.value = "";
    output.innerText = `${window.location.origin}/${data.url}`;
  } catch (e) {
    console.error("Something went wrong:", e);
    alert("Something went wrong. Check the console for details.");
  }
});

clipboard.addEventListener('click', async () => {
  const text = output.textContent;
  if (text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      alert("Error copying!");
    }
  } else {
    alert("Nothing to copy!");
  }
});
