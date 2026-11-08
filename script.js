(() => {
  "use strict";

  const sections = [...document.querySelectorAll(".story-section")];
  const quickMenu = document.querySelector("#quickMenu");
  const quickMenuToggle = document.querySelector("#quickMenuToggle");
  const cartaPreview = document.querySelector("#cartaPreview");
  const cartaButton = document.querySelector("[data-open-carta]");
  const heroCartaButton = document.querySelector("[data-open-menu-preview]");
  const mapButton = document.querySelector("[data-open-map]");
  const userButton = document.querySelector("[data-open-user]");
  const contactButton = document.querySelector("[data-open-contact]");
  const hoursButton = document.querySelector("[data-open-hours]");
  const cartButton = document.querySelector("[data-open-cart]");
  const cartViewMenuButton = cartaPreview.querySelector("[data-cart-view-menu]");
  const reservationButtons = document.querySelectorAll("[data-open-reservation]");
  const liveMapButton = cartaPreview.querySelector("[data-show-live-map]");
  const reservationPlanButton = cartaPreview.querySelector("[data-show-reservation-plan]");
  const cartaClose = document.querySelector(".carta-preview-close");
  const previewTitle = cartaPreview.querySelector(".carta-preview-header h2");
  const userForm = cartaPreview.querySelector(".user-form");
  const userFormMessage = cartaPreview.querySelector(".user-form-message");
  const userFormIntro = cartaPreview.querySelector(".user-form-intro");
  const userFormSubmit = cartaPreview.querySelector(".user-form-submit");
  const userFormSwitch = cartaPreview.querySelector("[data-toggle-auth]");
  const authPrompt = cartaPreview.querySelector("[data-auth-prompt]");
  const contactForm = cartaPreview.querySelector(".contact-form");
  const contactFormStatus = cartaPreview.querySelector(".contact-form-status");
  const toast = document.querySelector(".toast");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let toastTimer;
  let previewTrigger = cartaButton;
  let previewAnchorBounds = null;

  quickMenuToggle.addEventListener("click", () => {
    const isCollapsed = quickMenu.classList.toggle("collapsed");
    quickMenuToggle.setAttribute("aria-expanded", String(!isCollapsed));
    quickMenuToggle.setAttribute("aria-label", isCollapsed ? "Abrir menú" : "Cerrar menú");
  });

  const setPreviewOpen = (type, trigger, layout = "side") => {
    const isOpen = cartaPreview.classList.contains("is-open");
    const isSamePanel = cartaPreview.dataset.panel === type;

    if (isOpen && isSamePanel && previewTrigger === trigger) {
      cartaPreview.classList.remove("is-open");
      cartaPreview.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
      return;
    }

    previewAnchorBounds = layout === "right" ? trigger.getBoundingClientRect() : null;
    if (previewTrigger !== trigger) {
      previewTrigger.setAttribute("aria-expanded", "false");
    }
    previewTrigger = trigger;
    cartaPreview.dataset.panel = type;
    cartaPreview.dataset.layout = layout;
    if (type === "reservation") {
      cartaPreview.dataset.reservationView = "plan";
    }
    cartaPreview.classList.toggle("is-centered", layout === "center");
    const panelLabels = {
      carta: { title: "Carta", label: "Carta del café" },
      reservation: { title: "Reserva de mesa", label: "Reserva de mesa en Café Origen" },
      map: { title: "Ubicación", label: "Ubicación de Café Origen" },
      user: {
        title: userForm.dataset.mode === "register" ? "Crear cuenta" : "Acceso de usuario",
        label: "Acceso de usuario de Café Origen",
      },
      contact: { title: "Contacto", label: "Contacto de Café Origen" },
      hours: { title: "Horario", label: "Horario de Café Origen" },
      cart: { title: "Carrito", label: "Carrito de compra de Café Origen" },
    };
    const panel = panelLabels[type];
    cartaPreview.setAttribute("aria-label", panel.label);
    cartaPreview.setAttribute("aria-hidden", "false");
    previewTitle.textContent = panel.title;
    const closeLabel = {
      user: "panel",
      contact: "panel",
      hours: "horario",
      cart: "carrito",
      map: "ubicación",
      carta: "carta",
      reservation: "reserva",
    };
    cartaClose.setAttribute("aria-label", `Cerrar ${closeLabel[type]}`);
    cartaPreview.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    positionCartaPreview();
    if (type === "user") {
      userFormMessage.textContent = "";
      userForm.elements[userForm.dataset.mode === "register" ? "fullName" : "username"].focus();
    } else if (type === "contact") {
      contactFormStatus.textContent = "";
      contactForm.elements.name.focus();
    } else if (type === "cart") {
      cartViewMenuButton.focus();
    } else {
      cartaClose.focus();
    }
  };

  const closePreview = () => {
    cartaPreview.classList.remove("is-open");
    cartaPreview.setAttribute("aria-hidden", "true");
    previewTrigger.setAttribute("aria-expanded", "false");
    const focusTarget = previewTrigger.getClientRects().length ? previewTrigger : cartaButton;
    focusTarget.focus();
  };

  const positionCartaPreview = () => {
    if (cartaPreview.dataset.layout === "center") {
      cartaPreview.style.left = "";
      cartaPreview.style.top = "";
      return;
    }

    if (window.matchMedia("(max-width: 640px)").matches) {
      cartaPreview.style.left = "";
      cartaPreview.style.top = "";
      return;
    }

    if (cartaPreview.dataset.layout === "right" && previewAnchorBounds) {
      const previewBounds = cartaPreview.getBoundingClientRect();
      const viewportMargin = 16;
      const maxLeft = Math.max(viewportMargin, window.innerWidth - previewBounds.width - viewportMargin);
      const left = Math.min(previewAnchorBounds.right + 14, maxLeft);
      const anchorCenter = previewAnchorBounds.top + previewAnchorBounds.height / 2;
      const minTop = previewBounds.height / 2 + viewportMargin;
      const maxTop = Math.max(minTop, window.innerHeight - previewBounds.height / 2 - viewportMargin);
      const top = Math.min(maxTop, Math.max(minTop, anchorCenter));
      cartaPreview.style.left = `${Math.max(viewportMargin, left)}px`;
      cartaPreview.style.top = `${top}px`;
      return;
    }

    cartaPreview.style.top = "";
    const menuBounds = quickMenu.getBoundingClientRect();
    const previewWidth = cartaPreview.getBoundingClientRect().width;
    const left = Math.max(16, menuBounds.left - previewWidth - 14);
    cartaPreview.style.left = `${left}px`;
  };

  heroCartaButton.addEventListener("click", (event) => {
    event.preventDefault();
    setPreviewOpen("carta", heroCartaButton, "right");
  });
  reservationButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setPreviewOpen("reservation", button, "center");
    });
  });
  cartaButton.addEventListener("click", () => setPreviewOpen("carta", cartaButton));
  mapButton.addEventListener("click", () => setPreviewOpen("map", mapButton));
  userButton.addEventListener("click", () => setPreviewOpen("user", userButton));
  contactButton.addEventListener("click", () => setPreviewOpen("contact", contactButton));
  hoursButton.addEventListener("click", () => setPreviewOpen("hours", hoursButton));
  cartButton.addEventListener("click", () => setPreviewOpen("cart", cartButton));
  cartViewMenuButton.addEventListener("click", () => setPreviewOpen("carta", cartViewMenuButton, "right"));
  liveMapButton.addEventListener("click", () => {
    cartaPreview.dataset.reservationView = "live";
    reservationPlanButton.focus();
  });
  reservationPlanButton.addEventListener("click", () => {
    cartaPreview.dataset.reservationView = "plan";
    liveMapButton.focus();
  });
  document.querySelectorAll("[data-panel-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setPreviewOpen(link.dataset.panelTarget, link, "center");
    });
  });
  cartaClose.addEventListener("click", closePreview);
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!userForm.reportValidity()) return;
    const isRegistering = userForm.dataset.mode === "register";
    if (isRegistering && userForm.elements.password.value !== userForm.elements.confirmPassword.value) {
      userForm.elements.confirmPassword.setCustomValidity("Las contraseñas no coinciden.");
      userForm.elements.confirmPassword.reportValidity();
      return;
    }
    userForm.elements.confirmPassword.setCustomValidity("");
    userFormMessage.textContent = isRegistering
      ? "La creación de cuentas todavía no está conectada."
      : "El acceso de usuarios todavía no está conectado.";
  });
  userForm.elements.confirmPassword.addEventListener("input", () => {
    userForm.elements.confirmPassword.setCustomValidity("");
  });
  userFormSwitch.addEventListener("click", () => {
    const isRegistering = userForm.dataset.mode !== "register";
    userForm.dataset.mode = isRegistering ? "register" : "login";
    userForm.querySelectorAll("[data-register-only]").forEach((field) => {
      field.hidden = !isRegistering;
      field.querySelector("input").required = isRegistering;
    });
    userForm.querySelectorAll("[data-login-only]").forEach((field) => {
      field.hidden = isRegistering;
    });
    userFormIntro.textContent = isRegistering
      ? "Crea tu cuenta de Café Origen"
      : "Accede a tu cuenta de Café Origen";
    previewTitle.textContent = isRegistering ? "Crear cuenta" : "Acceso de usuario";
    userFormSubmit.textContent = isRegistering ? "Crear cuenta" : "Iniciar sesión";
    authPrompt.textContent = isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
    userFormSwitch.textContent = isRegistering ? "Iniciar sesión" : "Crear cuenta";
    userFormMessage.textContent = "";
    userForm.elements[isRegistering ? "fullName" : "username"].focus();
  });
  cartaPreview.querySelector("[data-forgot-password]").addEventListener("click", () => {
    userFormMessage.textContent = "La recuperación de contraseña todavía no está disponible.";
  });
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const formData = new FormData(contactForm);
    const subject = `Mensaje de contacto de ${formData.get("name")}`;
    const body = [
      `Nombre: ${formData.get("name")}`,
      `Correo: ${formData.get("email")}`,
      "",
      String(formData.get("message")),
    ].join("\n");
    contactFormStatus.textContent = "Se abrirá tu aplicación de correo para enviar el mensaje.";
    window.location.href = `mailto:cafeorigen@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  quickMenu.addEventListener("transitionend", positionCartaPreview);
  window.addEventListener("resize", positionCartaPreview);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartaPreview.classList.contains("is-open")) {
      closePreview();
    }
  });

  document.querySelectorAll(".quick-menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".quick-menu-item").forEach((link) => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });
      item.classList.add("is-active");
      item.setAttribute("aria-current", "location");
    });
  });

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch((error) => {
            if (error.name !== "AbortError") {
              console.warn("A story video could not start playing.", error);
            }
          });
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".section-video").forEach((video) => {
    videoObserver.observe(video);
  });

  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      toast.textContent = button.dataset.toast;
      toast.classList.add("is-visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 2600);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
  });
})();
