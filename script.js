const manuscriptInput = document.getElementById("manuscriptInput");
const renderButton = document.getElementById("renderButton");
const downloadButton = document.getElementById("downloadButton");
const printContainer = document.getElementById("printContainer");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isChapterLine(line) {
  const clean = line.trim();
  return (
    /^chapter\s+[\w\d]+/i.test(clean) ||
    /^(#{1,6}\s+)?chapter\b/i.test(clean)
  );
}

function toParagraphs(sectionText) {
  return sectionText
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function buildChapterHtml(title, content, index) {
  const heading = `<h2 class="chapter-title">${escapeHtml(title)}</h2>`;
  const paragraphs = toParagraphs(content);
  const chapterClass = index === 0 ? "chapter first-chapter" : "chapter";
  return `<article class="${chapterClass}">${heading}${paragraphs}</article>`;
}

function parseManuscript(rawText) {
  const lines = rawText.split(/\r?\n/);
  const chapters = [];
  let currentTitle = "Chapter 1";
  let buffer = [];
  let chapterFound = false;

  const flush = () => {
    const content = buffer.join("\n").trim();
    if (content) {
      chapters.push({ title: currentTitle, content });
    }
    buffer = [];
  };

  lines.forEach((line) => {
    if (isChapterLine(line)) {
      if (chapterFound || buffer.join("").trim()) {
        flush();
      }
      chapterFound = true;
      currentTitle = line.replace(/^#{1,6}\s*/, "").trim();
      return;
    }
    buffer.push(line);
  });

  flush();

  if (chapters.length === 0 && rawText.trim()) {
    chapters.push({ title: "Chapter 1", content: rawText.trim() });
  }

  return chapters;
}

function renderBook() {
  const rawText = manuscriptInput.value;
  if (!rawText.trim()) {
    printContainer.hidden = true;
    printContainer.innerHTML = "";
    return null;
  }

  const chapters = parseManuscript(rawText);
  const chapterMarkup = chapters
    .map((chapter, index) => buildChapterHtml(chapter.title, chapter.content, index))
    .join("");

  printContainer.innerHTML = `<div class="book">${chapterMarkup}</div>`;
  printContainer.hidden = false;
  return printContainer.firstElementChild;
}

renderButton.addEventListener("click", renderBook);

downloadButton.addEventListener("click", () => {
  if (!renderBook()) {
    alert("Please paste manuscript text before downloading.");
    return;
  }

  window.print();
});
