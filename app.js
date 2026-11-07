(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let toastTimer;
  function toast(message) {
    const element = $(".toast");
    element.textContent = message;
    element.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("visible"), 4000);
  }

  // Native dialogs preserve keyboard navigation, focus trapping and Escape support.
  let dialogTrigger = null;
  function openDialog(dialog, trigger) {
    if (dialog.open) return;
    dialogTrigger = trigger || document.activeElement;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }
  $$("dialog").forEach((dialog) => {
    $("[data-close-dialog]", dialog).addEventListener("click", () =>
      closeDialog(dialog),
    );
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          closeDialog(dialog);
      }
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      $(".menu-toggle").setAttribute("aria-expanded", "false");
      dialogTrigger?.focus({ preventScroll: true });
    });
  });
  $(".menu-toggle").addEventListener("click", (event) => {
    openDialog($("#menu-dialog"), event.currentTarget);
    event.currentTarget.setAttribute("aria-expanded", "true");
  });
  $$("#menu-dialog a").forEach((link) =>
    link.addEventListener("click", () => closeDialog($("#menu-dialog"))),
  );
  $("#contact-open").addEventListener("click", (event) =>
    openDialog($("#contact-dialog"), event.currentTarget),
  );
  $("#credits-open").addEventListener("click", (event) =>
    openDialog($("#credits-dialog"), event.currentTarget),
  );

  const projects = {
    flux: {
      title: "流动的秩序",
      en: "FLUX / 01",
      image: "assets/work-flux.png",
      alt: "透明银色波浪与黄绿色圆环",
      category: "01 / DIGITAL ART & MATERIAL STUDY",
      description:
        "当柔软与坚硬相遇，秩序不再只有一种形状。我们以透明玻璃、镜面金属与一束酸性黄绿为线索，探索流动的材质如何形成清晰的视觉节奏。这个概念系列关注光线穿过表面的瞬间，也关注静止画面中仍然存在的运动感。",
      tags: ["材质研究", "数字艺术", "动态视觉"],
    },
    refraction: {
      title: "折射档案",
      en: "REFRACTION / 02",
      image: "assets/work-refraction.png",
      alt: "透明结构与钴蓝丝带的折射装置",
      category: "02 / SPATIAL NARRATIVE",
      description:
        "看见的，不止是物体本身。透明的结构、穿行的蓝色与反射的光，构成一份关于空间的观察档案。作品尝试将建筑般的秩序与丝带的自由放在一起，让每一次视角变化，都带来新的层次。",
      tags: ["空间叙事", "光学实验", "三维概念"],
    },
    afterimage: {
      title: "残像计划",
      en: "AFTERIMAGE / 03",
      image: "assets/work-afterimage.png",
      alt: "珊瑚橙雕塑与银色金属织物",
      category: "03 / VISUAL IDENTITY & MOTION",
      description:
        "一瞬即逝的动作，也能留下鲜明的印象。以珊瑚橙为情绪中心，镜面材质为它建立延伸的回声。这个视觉概念从运动的轨迹出发，思考一种形态如何在不同尺度和媒介中保持自己的性格。",
      tags: ["动态语言", "视觉系统", "形态探索"],
    },
    quiet: {
      title: "静默结构",
      en: "QUIET STRUCTURES / 04",
      image: "assets/work-quiet.png",
      alt: "混凝土建筑中的自然光与阴影",
      category: "04 / ARCHITECTURE & FEELING",
      description:
        "让光成为空间的叙事者。在安静的混凝土结构之间，一束光改变了观看的顺序。作品用有限的材质和克制的构图，探索空隙、尺度与时间如何构成情绪，也为屏幕中的视觉节奏寻找另一种参照。",
      tags: ["光影研究", "空间观察", "编辑视觉"],
    },
  };
  let currentProject = "flux";
  function showProject(id, trigger) {
    const project = projects[id];
    if (!project) return;
    currentProject = id;
    $("#project-title").textContent = project.title;
    $("#project-en").textContent = project.en;
    $("#project-category").textContent = project.category;
    $("#project-description").textContent = project.description;
    $("#project-image").src = project.image;
    $("#project-image").alt = project.alt;
    $("#project-tags").replaceChildren(
      ...project.tags.map((text) => {
        const tag = document.createElement("span");
        tag.textContent = text;
        return tag;
      }),
    );
    if (!$("#project-dialog").open) openDialog($("#project-dialog"), trigger);
    $("#project-dialog").scrollTop = 0;
  }
  $$("[data-project]").forEach((button) =>
    button.addEventListener("click", () =>
      showProject(button.dataset.project, button),
    ),
  );
  $("#project-next").addEventListener("click", () => {
    const keys = Object.keys(projects);
    showProject(keys[(keys.indexOf(currentProject) + 1) % keys.length]);
  });

  // Horizontal archive uses native scrolling, preserving touch and keyboard behavior.
  const gallery = $(".gallery-track");
  const galleryItems = $$(".gallery-piece");
  let galleryFrame = 0;
  function updateGallery() {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const progress = max > 0 ? gallery.scrollLeft / max : 0;
    $(".gallery-meter > span").style.width = `${25 + progress * 75}%`;
    const galleryRect = gallery.getBoundingClientRect();
    const center = galleryRect.left + galleryRect.width / 2;
    let nearest = 0,
      distance = Infinity;
    galleryItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (nextDistance < distance) {
        nearest = index;
        distance = nextDistance;
      }
    });
    $(".gallery-position").textContent =
      `${String(nearest + 1).padStart(2, "0")} / 04`;
    $('[data-gallery-step="-1"]').disabled = gallery.scrollLeft < 3;
    $('[data-gallery-step="1"]').disabled = max - gallery.scrollLeft < 3;
    galleryFrame = 0;
  }
  gallery.addEventListener(
    "scroll",
    () => {
      if (!galleryFrame) galleryFrame = requestAnimationFrame(updateGallery);
    },
    { passive: true },
  );
  $$("[data-gallery-step]").forEach((button) =>
    button.addEventListener("click", () => {
      const step =
        galleryItems[0].getBoundingClientRect().width +
        parseFloat(getComputedStyle(gallery).columnGap || 0);
      gallery.scrollBy({
        left: Number(button.dataset.galleryStep) * step,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    }),
  );
  gallery.addEventListener("keydown", (event) => {
    if (
      event.target !== gallery ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    gallery.scrollBy({
      left: (event.key === "ArrowRight" ? 1 : -1) * gallery.clientWidth * 0.75,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  });
  updateGallery();

  // The sculpture is an art-directed raster object; perspective responds to drag.
  const stage = $(".lab-stage");
  const sculpture = $(".lab-sculpture");
  let rotationX = 0,
    rotationY = 0,
    drag = null;
  function applyRotation() {
    rotationX = Math.max(-32, Math.min(32, rotationX));
    rotationY = Math.max(-22, Math.min(22, rotationY));
    sculpture.style.setProperty("--rotate-x", `${rotationX.toFixed(1)}deg`);
    sculpture.style.setProperty("--rotate-y", `${rotationY.toFixed(1)}deg`);
    $(".lab-coordinate").textContent =
      `X ${Math.round(rotationX)}° / Y ${Math.round(rotationY)}°`;
  }
  function resetSculpture() {
    rotationX = 0;
    rotationY = 0;
    applyRotation();
  }
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rx: rotationX,
      ry: rotationY,
    };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("dragging");
  });
  stage.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    rotationX = drag.rx + (event.clientX - drag.x) * 0.1;
    rotationY = drag.ry - (event.clientY - drag.y) * 0.08;
    applyRotation();
  });
  function endDrag() {
    drag = null;
    stage.classList.remove("dragging");
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("lostpointercapture", endDrag);
  stage.addEventListener("dblclick", resetSculpture);
  stage.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
        event.key,
      )
    )
      return;
    event.preventDefault();
    if (event.key === "Home") return resetSculpture();
    if (event.key === "ArrowLeft") rotationX -= 4;
    if (event.key === "ArrowRight") rotationX += 4;
    if (event.key === "ArrowUp") rotationY += 4;
    if (event.key === "ArrowDown") rotationY -= 4;
    applyRotation();
  });
  $("#lab-reset").addEventListener("click", resetSculpture);
  $$(".palette").forEach((button) =>
    button.addEventListener("click", () => {
      $$(".palette").forEach((other) => {
        other.classList.toggle("active", other === button);
        other.setAttribute("aria-pressed", String(other === button));
      });
      const filters = {
        lime: "none",
        blue: "hue-rotate(145deg) saturate(1.1)",
        warm: "hue-rotate(305deg) saturate(1.25)",
      };
      sculpture.style.filter = filters[button.dataset.palette];
    }),
  );

  let isRebuilding = false;
  $$("[data-rebuild]").forEach((button) =>
    button.addEventListener("click", () => {
      if (!window.SwarmCursors)
        return toast("光标动画尚未准备好，请稍后再试。");
      if (window.SwarmCursors.isRunning()) return;
      window.SwarmCursors.start();
    }),
  );
  window.addEventListener("swarm:start", () => {
    isRebuilding = true;
    document.body.classList.add("swarm-active");
    $$("[data-reveal]").forEach((element) => element.classList.add("revealed"));
  });
  window.addEventListener("swarm:exit", () => {
    isRebuilding = false;
    document.body.classList.remove("swarm-active");
    toast("欢迎回来。继续探索，让想象发生。");
  });

  // Scroll work is coalesced in a single animation frame; no continuous render loop.
  let scrollFrame = 0;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $(".scroll-progress > span").style.height =
      `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
    scrollFrame = 0;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    updateScroll();
    updateGallery();
  });
  window.addEventListener("load", updateScroll);
  updateScroll();
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    document.body.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06, rootMargin: "0px 0px 60px 0px" },
    );
    $$("[data-reveal]").forEach((element) => observer.observe(element));
  }
  $(".hero").addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || isRebuilding) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--hero-x",
      `${((event.clientX - rect.left) / rect.width - 0.5) * 17}px`,
    );
    event.currentTarget.style.setProperty(
      "--hero-y",
      `${((event.clientY - rect.top) / rect.height - 0.5) * 13}px`,
    );
  });
  $(".hero").addEventListener("pointerleave", (event) => {
    event.currentTarget.style.setProperty("--hero-x", "0px");
    event.currentTarget.style.setProperty("--hero-y", "0px");
  });
  $$(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches || isRebuilding) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        "--mag-x",
        `${(event.clientX - rect.left - rect.width / 2) * 0.09}px`,
      );
      element.style.setProperty(
        "--mag-y",
        `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`,
      );
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mag-x", "0px");
      element.style.setProperty("--mag-y", "0px");
    });
  });

  // A working local brief flow: validate, preview, edit and download; no fake submit.
  let briefText = "",
    briefName = "";
  $("#brief-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    briefName = String(values.get("name")).trim();
    const idea = String(values.get("idea")).trim();
    if (!briefName || !idea)
      return toast("请填写称呼和想法，空格也需要换成文字。");
    briefText = `游隙 INTERPLAY｜创意简报\n\n称呼：${briefName}\n探索方向：${values.get("type")}\n\n我的想法\n${idea}\n\n下一步可以思考\n· 希望谁看见或使用这个作品？\n· 最想传递的一种感受是什么？\n· 哪个瞬间值得被记住？\n\n本简报在本机生成，未上传或发送。`;
    $(".brief-preview").textContent = briefText;
    form.hidden = true;
    $("#brief-result").hidden = false;
    $("#brief-download").focus();
  });
  $("#brief-edit").addEventListener("click", () => {
    $("#brief-form").hidden = false;
    $("#brief-result").hidden = true;
    $("#brief-idea").focus();
  });
  $("#brief-download").addEventListener("click", () => {
    const blob = new Blob(["\uFEFF", briefText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName =
      briefName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").slice(0, 30) ||
      "我的";
    link.download = `${safeName}-创意简报.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast("创意简报已生成，可以保存到本机。");
  });
})();
