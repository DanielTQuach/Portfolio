(function () {
  const list = document.querySelector(".projects-list");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".project-card"));
  if (!cards.length) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  function reset() {
    cards.forEach((card) => {
      card.style.removeProperty("--project-scale");
      card.style.removeProperty("--project-tilt");
      card.style.removeProperty("--project-opacity");
      card.style.removeProperty("margin-bottom");
      card.style.removeProperty("z-index");
      card.classList.remove("is-featured");
    });
  }

  function update() {
    frame = 0;
    if (motionQuery.matches) {
      reset();
      return;
    }

    const listStyle = getComputedStyle(list);
    const padTop = parseFloat(listStyle.paddingTop) || 0;
    const gap = parseFloat(listStyle.rowGap || listStyle.gap) || 0;
    const focusY = window.scrollY + window.innerHeight * 0.32;
    const range = Math.max(window.innerHeight * 0.9, 480);
    let y = window.scrollY + list.getBoundingClientRect().top + padTop;

    const naturalAnchors = cards.map((card) => {
      const height = card.offsetHeight;
      const anchor = y + height * 0.36;
      y += height + gap;
      return anchor;
    });
    const firstAnchor = naturalAnchors[0];
    const lastAnchor = naturalAnchors[naturalAnchors.length - 1];
    const origin = firstAnchor > focusY ? firstAnchor : lastAnchor < focusY ? lastAnchor : focusY;

    y = window.scrollY + list.getBoundingClientRect().top + padTop;
    let featured = cards[0];
    let closest = Infinity;
    const states = [];

    cards.forEach((card) => {
      const height = card.offsetHeight;
      const anchor = y + height * 0.36;
      const delta = anchor - origin;
      const distance = Math.abs(delta);
      const t = Math.min(distance / range, 1);
      const closeness = Math.cos((t * Math.PI) / 2);
      const scale = 0.74 + 0.26 * closeness;
      const opacity = 0.8 + 0.2 * closeness;
      const tilt = Math.max(-5, Math.min(5, (delta / range) * 6));
      const pull = height * (1 - scale) * 0.8;

      states.push({ card, scale, opacity, tilt, pull, distance });
      if (distance < closest) {
        closest = distance;
        featured = card;
      }

      y += height + gap - pull;
    });

    states.forEach(({ card, scale, opacity, tilt, pull }) => {
      card.style.setProperty("--project-scale", scale.toFixed(3));
      card.style.setProperty("--project-tilt", tilt.toFixed(2) + "deg");
      card.style.setProperty("--project-opacity", opacity.toFixed(3));
      card.style.marginBottom = `${(-pull).toFixed(2)}px`;
      card.style.zIndex = card === featured ? "5" : "1";
      card.classList.toggle("is-featured", card === featured);
    });
  }

  function requestUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  list.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", requestUpdate, { once: true });
  });

  motionQuery.addEventListener("change", requestUpdate);
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
})();
