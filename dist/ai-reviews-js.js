(() => {
  // src/ai-reviews-js.js
  var defaultReviews = [
    { author: "Mar\xEDa Gonz\xE1lez", text: "Desde que compr\xE9 este producto, he ahorrado tanto tiempo como dinero. La entrega lleg\xF3 rapid\xEDsimo y en perfectas condiciones. Es incre\xEDble c\xF3mo facilita mi d\xEDa a d\xEDa. \xA1Definitivamente vale la pena probarlo, no me arrepiento de la compra!" },
    { author: "Carlos Ram\xEDrez", text: "Llevaba meses buscando algo as\xED y finalmente lo encontr\xE9 aqu\xED. La atenci\xF3n al cliente fue muy buena, despejaron todas mis dudas con rapidez y profesionalismo. Muy satisfecho con la compra, es justo lo que necesitaba para resolver mi problema" },
    { author: "Laura Fern\xE1ndez", text: "No esperaba que este producto fuera de tanta calidad, pero ahora estoy muy satisfecha. La entrega fue r\xE1pida y sin complicaciones, lo que me dio mucha tranquilidad. Recomiendo este producto sin dudarlo, realmente super\xF3 mis expectativas iniciales." },
    { author: "Juan Mart\xEDnez", text: "Nunca me fiaba de comprar en estas p\xE1ginas, pero este producto me hizo cambiar de opini\xF3n. El servicio al cliente fue muy amable y eficiente. Estoy muy contento con la compra y siento que puedo confiar en este sitio para futuras compras." },
    { author: "Ana L\xF3pez", text: "Pens\xE9 que ser\xEDa una estafa, pero el producto lleg\xF3 en muy poco tiempo y fue tal como lo describen. Funcion\xF3 perfectamente desde el primer d\xEDa. Honestamente, estoy muy impresionado y definitivamente lo recomendar\xEDa a cualquiera." },
    { author: "Luis P\xE9rez", text: "Este producto ha solucionado un problema que ten\xEDa desde hace tiempo. La entrega fue incre\xEDblemente r\xE1pida y eficiente. Realmente cambi\xF3 mi rutina diaria para mejor. Muy satisfecho con la compra y siempre lo recomiendo a amigos y conocidos." },
    { author: "Marta S\xE1nchez", text: "Estaba buscando una soluci\xF3n a mi problema y este producto fue perfecto. El servicio al cliente fue muy servicial y atento, me ayudaron en todo momento. Lo recomiendo sin dudar, es una inversi\xF3n que realmente vale la pena." },
    { author: "Diego Rivera", text: "El precio me pareci\xF3 muy razonable para la calidad que ofrece. Realmente ha sido una muy buena inversi\xF3n. He notado mejoras significativas en mi rutina diaria desde que lo uso. Es definitivamente algo que recomendar\xEDa a quien busque calidad a buen precio." },
    { author: "Patricia G\xF3mez", text: "Es justo lo que necesitaba. La atenci\xF3n al cliente fue excelente y siempre estuvieron dispuestos a ayudar con mis dudas. Estoy muy satisfecho con mi compra y no dudar\xE9 en recomendar este producto a mis amigos y familiares." },
    { author: "Javier Torres", text: "Ten\xEDa mis dudas pero este producto cumpli\xF3 con todas mis expectativas. La entrega fue muy r\xE1pida, lleg\xF3 antes de lo que esperaba y sin ning\xFAn inconveniente. Estoy muy contento con la compra y lo recomendar\xEDa sin dudar." },
    { author: "Claudia Hern\xE1ndez", text: "Este producto ha sido de gran ayuda para mi d\xEDa a d\xEDa. La atenci\xF3n al cliente es fenomenal y resolvieron todas mis dudas inmediatamente. Lo recomiendo a quienes busquen una buena soluci\xF3n para facilitar su rutina diaria." },
    { author: "Alberto Ruiz", text: "No era f\xE1cil encontrar algo as\xED, pero aqu\xED lo tienen. La entrega fue sorprendentemente r\xE1pida y eficiente, lo cual agradezco mucho. Muy feliz con mi compra, el producto funciona perfectamente y cumple con todas mis expectativas." },
    { author: "Daniela Castillo", text: "La durabilidad de este producto es impresionante. Lo uso todos los d\xEDas y sigue como nuevo. Realmente lo recomendar\xEDa a cualquiera que busque un producto fiable y duradero. Estoy extremadamente satisfecho con mi compra." },
    { author: "Pablo Vargas", text: "Me sorprendi\xF3 lo r\xE1pido que lleg\xF3 el paquete y la calidad del producto. El env\xEDo fue tan r\xE1pido que no tuve que esperar nada. Estoy muy satisfecho con la compra y el producto cumple todas mis expectativas." },
    { author: "Sof\xEDa Morales", text: "Este producto ha sido clave para mejorar mi rutina diaria. Me ahorra mucho tiempo y esfuerzo, y la verdad es que fue una inversi\xF3n excelente. Sin duda, fue una buena compra que volver\xEDa a hacer sin pensarlo dos veces." },
    { author: "Fernando Guti\xE9rrez", text: "La rapidez en la entrega me sorprendi\xF3 gratamente. El producto es de buena calidad y cumple su funci\xF3n perfectamente, justo lo que necesitaba. Definitivamente lo recomendar\xEDa a quienes buscan eficiencia y calidad en un mismo producto." },
    { author: "Carolina Castro", text: "El producto es justo lo que necesitaba y la atenci\xF3n al cliente fue estupenda. Me ayudaron con todas mis dudas de forma r\xE1pida y efectiva. Lo recomendar\xE9 a mis amigos, estoy completamente satisfecho con mi experiencia de compra." },
    { author: "Ricardo D\xEDaz", text: "Hab\xEDa probado otros y ninguno como este. La calidad del producto es excelente y cumpli\xF3 con todas mis expectativas. La entrega fue muy r\xE1pida y sin problemas. \xA1Lo recomiendo a cualquiera que busque calidad y eficiencia en un solo producto!" },
    { author: "Elena Vargas", text: "Desde que lo tengo, he notado una mejora significativa en mis actividades diarias. La atenci\xF3n al cliente fue muy cordial y siempre estuvieron disponibles para ayudarme. Definitivamente lo recomendar\xE9, realmente ha marcado una diferencia en mi rutina." },
    { author: "Andr\xE9s Mendoza", text: "Este producto me ha facilitado mucho la vida. Lleg\xF3 antes de lo previsto y en perfectas condiciones. Estoy muy satisfecho con la compra y lo recomendar\xE9 sin dudas a quienes buscan soluciones pr\xE1cticas y de calidad." }
  ];
  var reviewsMediaRaw = document.querySelector("#reviews-media").textContent;
  var reviewsMedia = JSON.parse(reviewsMediaRaw);
  for (let i = 0; i < reviewsMedia.length; i++) {
    delete reviewsMedia[i].preview_image;
  }
  var [mainSelector, secondarySelector] = document.querySelectorAll("variant-selects");
  var mainInputs = mainSelector.querySelectorAll("input");
  var secondaryInputs = secondarySelector.querySelectorAll("input");
  mainSelector.addEventListener("change", (e) => {
    const index = [...mainInputs].indexOf(e.target);
    secondaryInputs[index].checked = true;
  });
  secondarySelector.addEventListener("change", (e) => {
    e.stopImmediatePropagation();
    const index = [...secondaryInputs].indexOf(e.target);
    mainInputs[index].click();
  });
  var Storage = {
    get(key) {
      return this[key];
    },
    set(key, value) {
      this[key] = value;
    }
  };
  var storage = Object.create(Storage);
  function maxSlide() {
    const columns = getComputedStyle(reviewsScroll).getPropertyValue("--review-columns");
    return rawReviews.length - columns + 2;
  }
  function scrollToSlide(slideIndex) {
    console.log("move to: " + slideIndex);
    const currentSlide2 = document.querySelector(`.review-slide:nth-child(${slideIndex})`);
    currentSlide2.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }
  var rawReviews = [];
  var reviewsScroll = null;
  var currentSlide = interval = collapsible = dialog = null;
  function init() {
    console.log("Javascript :: Init");
    currentSlide = 2;
    interval = null;
    collapsible = document.querySelector("#reviews-collapsible");
    const controlButtons = document.querySelectorAll(".reviews-paginator>button");
    controlButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = parseInt(button.dataset.direction);
        const rows = getComputedStyle(reviewsScroll).getPropertyValue("--review-rows");
        const newSlide = currentSlide + direction * (parseInt(rows) + 1);
        if (newSlide < 2 || newSlide > maxSlide()) return;
        currentSlide = newSlide;
        scrollToSlide(currentSlide);
      });
    });
    dialog = document.querySelector("#reviews-dialog");
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
  function dispose() {
    console.log("Javascript :: Dispose");
    clearInterval(interval);
  }
  init();
  if (Shopify.designMode) {
    document.addEventListener("shopify:section:load", init);
    document.addEventListener("shopify:section:unload", dispose);
  }
  function autoScroll() {
    interval = setInterval(() => {
      const rows = getComputedStyle(reviewsScroll).getPropertyValue("--review-rows");
      currentSlide = currentSlide + 1 + parseInt(rows);
      if (currentSlide > maxSlide() - 1) {
        currentSlide = 2;
      }
      scrollToSlide(currentSlide);
    }, 3e3);
  }
  async function fetchReviews(shopId, productId) {
    const storeCache = storage.get(shopId);
    let store = null;
    if (!storeCache) {
      store = await getStoreInfo(shopId);
      storage.set(shopId, store);
    } else {
      store = storeCache;
    }
    if (!store.active) {
      throw new Error("No se ha registrado el pago, por favor, cancele para continuar usando el programa.");
    }
    const productCache = storage.get(productId);
    let product = null;
    if (!productCache) {
      console.log("Cargando reviews");
      product = await getProductInfo(shopId, productId);
      storage.set(productId, product);
    } else {
      product = productCache;
    }
    let reviews = null;
    if (product?.exists) {
      reviews = product.reviews;
    } else {
      reviews = defaultReviews;
    }
    return reviews;
  }
  function formatReviews(unformattedReviews) {
    const reviews = structuredClone(unformattedReviews);
    const now = /* @__PURE__ */ new Date();
    let today = now.getDate();
    let month = now.getMonth();
    const year = now.getFullYear();
    if (today < 5) {
      today = new Date(year, month, 0).getDate();
    } else {
      today--;
      month++;
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    for (let i = 0; i < reviews.length; i++) {
      const day = Math.floor(Math.random() * today) + 1;
      const date = /* @__PURE__ */ new Date(`${year}/${month}/${day}`);
      const stars = Math.round(Math.random() * 1 + 4);
      reviews[i].date = new Intl.DateTimeFormat("es", options).format(date);
      reviews[i].stars = stars;
    }
    return reviews;
  }
  document.addEventListener("alpine:init", () => {
    Alpine.data("reviewsData", () => ({
      async init() {
        console.log("Alpine :: Init");
        this.$watch("reviews", () => {
          if (!this.reviews.length) return;
          reviewsScroll = document.querySelector(".reviews");
          const autoplay = document.querySelector("#scroll-type").value === "auto";
          if (autoplay) {
            autoScroll();
          }
        });
        this.$watch("success", (value) => {
          if (value) collapsible.dataset.open = "true";
        });
        this.$watch("error", (value) => {
          if (value) collapsible.dataset.open = "true";
        });
        try {
          this.images = reviewsMedia;
          const shopId = document.querySelector("#shop-id").value;
          const productId = document.querySelector("#product-id").value;
          rawReviews = await fetchReviews(shopId, productId);
          this.reviews = formatReviews(rawReviews);
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
          this.initializing = false;
        }
      },
      toggleDialog(selected) {
        if (selected) {
          this.expandedReview = selected;
          dialog.showModal();
        } else {
          dialog.close();
          this.expandedReview = null;
        }
      },
      reviews: [],
      images: [],
      expandedReview: null,
      country: Shopify.country,
      initializing: true,
      loading: true,
      success: null,
      error: null,
      reset() {
        this.loading = true;
        collapsible.dataset.open = "false";
        setTimeout(() => {
          this.success = null;
          this.error = null;
        }, 300);
      },
      async generateReviews() {
        if (this.loading) return;
        this.reset();
        const form = Object.fromEntries(new FormData(this.$el));
        if (!form.prompt) return;
        try {
          const response = await fetch(
            `https://us-central1-shopify-reviews-422715.cloudfunctions.net/generateReviews${this.country}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form)
            }
          );
          const json = await response.json();
          if (!json.ok) {
            throw new Error(json.error);
          }
          rawReviews = json.reviews;
          storage.set(form.productId, { exists: true, reviews: rawReviews });
          this.reviews = formatReviews(rawReviews);
          this.success = { message: "Rese\xF1as generadas exitosamente." };
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async saveReviews() {
        if (this.loading) return;
        this.reset();
        const form = Object.fromEntries(new FormData(this.$el));
        const body = {
          shopId: form.shopId,
          product: {
            id: form.productId,
            name: form.productName,
            reviews: rawReviews
          }
        };
        try {
          const response = await fetch(
            "https://us-central1-shopify-reviews-422715.cloudfunctions.net/saveReviews",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            }
          );
          const json = await response.json();
          if (!json.ok) {
            throw new Error(json.error);
          }
          this.success = { message: "Rese\xF1as guardadas exitosamente." };
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      }
    }));
  });
})();
