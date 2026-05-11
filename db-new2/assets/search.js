(() => {
  const input = document.querySelector("#navSearch");

  const items = Array.from(document.querySelectorAll(".nav-link, .index-row"));

  const getText = (item) => {
    const title = item.dataset.title || item.textContent || "";
    const source = item.dataset.source || "";
    return (title + " " + source + " " + item.textContent).toLowerCase();
  };

  if (input) {
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      for (const item of items) {
        item.classList.toggle("is-hidden", query && !getText(item).includes(query));
      }
    });
  }

  const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
  if (!galleryCards.length) return;

  const q = document.querySelector("#gallerySearch");
  const category = document.querySelector("#galleryCategory");
  const brand = document.querySelector("#galleryBrand");
  const year = document.querySelector("#galleryYear");
  const level = document.querySelector("#galleryLevel");
  const count = document.querySelector("#galleryCount");
  const dialog = document.querySelector("#imageDialog");
  const dialogImage = document.querySelector("#dialogImage");
  const dialogTitle = document.querySelector("#dialogTitle");
  const dialogMeta = document.querySelector("#dialogMeta");
  const dialogSource = document.querySelector("#dialogSource");
  const dialogClose = document.querySelector(".dialog-close");

  const visible = (card) => {
    const query = (q?.value || "").trim().toLowerCase();
    if (query && !card.dataset.search.includes(query)) return false;
    if (category?.value && card.dataset.category !== category.value) return false;
    if (year?.value && card.dataset.year !== year.value) return false;
    if (level?.value && card.dataset.level !== level.value) return false;
    if (brand?.value && !card.dataset.brands.split("|").includes(brand.value)) return false;
    return true;
  };

  const applyGalleryFilters = () => {
    let shown = 0;
    for (const card of galleryCards) {
      const ok = visible(card);
      card.classList.toggle("is-hidden", !ok);
      if (ok) shown += 1;
    }
    if (count) count.textContent = String(shown);
  };

  for (const control of [q, category, brand, year, level].filter(Boolean)) {
    control.addEventListener("input", applyGalleryFilters);
    control.addEventListener("change", applyGalleryFilters);
  }

  const metaRow = (label, value) => value ? "<dt>" + label + "</dt><dd>" + value + "</dd>" : "";

  for (const card of galleryCards) {
    card.addEventListener("click", () => {
      const item = JSON.parse(decodeURIComponent(card.dataset.image));
      dialogImage.src = item.local_path || item.thumbnail_path || "";
      dialogImage.alt = item.title || "";
      dialogTitle.textContent = item.title || item.category || "图片详情";
      dialogMeta.innerHTML = [
        metaRow("分类", item.category),
        metaRow("日期", item.date || "未标日期"),
        metaRow("场景", item.scene),
        metaRow("来源", item.source_name),
        metaRow("等级", item.source_level),
        metaRow("关联品牌/机构", (item.brand_tags || []).join("、")),
        metaRow("风格", (item.style_tags || []).join("、")),
        metaRow("单品", (item.item_tags || []).join("、")),
        metaRow("状态", item.verification_status + " / " + item.privacy_status),
        metaRow("权利", item.rights_note),
      ].join("");
      dialogSource.href = item.page_url || "#";
      if (dialog?.showModal) dialog.showModal();
    });
  }

  dialogClose?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  applyGalleryFilters();
})();
