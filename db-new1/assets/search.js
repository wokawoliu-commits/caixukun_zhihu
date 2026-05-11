(() => {
  const input = document.querySelector("#navSearch");
  if (!input) return;

  const items = Array.from(document.querySelectorAll(".nav-link, .index-row"));

  const getText = (item) => {
    const title = item.dataset.title || item.textContent || "";
    const source = item.dataset.source || "";
    return (title + " " + source + " " + item.textContent).toLowerCase();
  };

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    for (const item of items) {
      item.classList.toggle("is-hidden", query && !getText(item).includes(query));
    }
  });
})();
