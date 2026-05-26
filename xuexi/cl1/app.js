const unitSearch = document.querySelector("#unitSearch");
const unitItems = Array.from(document.querySelectorAll(".unit-item"));
const unitCount = document.querySelector("#unitCount");
const sampleTabs = Array.from(document.querySelectorAll(".sample-tab"));
const samplePanels = Array.from(document.querySelectorAll(".sample-panel"));
const copyPrompt = document.querySelector("#copyPrompt");
const promptText = document.querySelector("#promptText");
const printPage = document.querySelector("#printPage");
const navLinks = Array.from(document.querySelectorAll(".side-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateUnitFilter() {
  const query = unitSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  unitItems.forEach((item) => {
    const haystack = `${item.textContent} ${item.dataset.keywords}`.toLowerCase();
    const visible = !query || haystack.includes(query);
    item.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  unitCount.textContent = String(visibleCount);
}

function activateSamplePanel(name) {
  sampleTabs.forEach((tab) => {
    const active = tab.dataset.panel === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  samplePanels.forEach((panel) => {
    const active = panel.id === `panel-${name}`;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function setActiveNav(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

unitSearch?.addEventListener("input", updateUnitFilter);

sampleTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateSamplePanel(tab.dataset.panel));
});

copyPrompt?.addEventListener("click", async () => {
  const text = promptText.textContent.trim();

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    copyPrompt.textContent = "已复制";
    window.setTimeout(() => {
      copyPrompt.textContent = "复制提示词";
    }, 1400);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);

    copyPrompt.textContent = copied ? "已复制" : "复制失败";
    window.setTimeout(() => {
      copyPrompt.textContent = "复制提示词";
    }, 1400);
  }
});

printPage?.addEventListener("click", () => {
  window.print();
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActiveNav(visible.target.id);
      }
    },
    {
      rootMargin: "-20% 0px -64% 0px",
      threshold: [0.12, 0.24, 0.36],
    },
  );

  sections.forEach((section) => observer.observe(section));
}
