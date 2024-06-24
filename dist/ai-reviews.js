(() => {
  // src/ai-reviews.js
  var CustomCollapsible = class extends HTMLElement {
    constructor() {
      super();
    }
    /**
     * @param {Event} e
     */
    #collapsibleListener(e) {
      const { id } = e.details;
      if (id !== this.getAttribute("id")) return;
      this.toggle();
    }
    connectedCallback() {
      this.addEventListener("toggle-collapsible", this.#collapsibleListener);
    }
    disconnectedCallback() {
      this.removeEventListener("toggle-collapsible", this.#collapsibleListener);
    }
    toggle() {
      const open = this.getAttribute("open") !== null;
      open ? this.removeAttribute("open") : this.setAttribute("open", "");
    }
  };
  customElements.define("custom-collapsible", CustomCollapsible);
  var CustomSlideshow = class extends HTMLElement {
    #currentSlide = 2;
    #interval = null;
    #slideshow;
    static observedAttributes = ["autoplay"];
    constructor() {
      super();
    }
    connectedCallback() {
      this.#slideshow = this.querySelector(".slideshow-scrollable");
      if (this.getAttribute("autoplay") !== null) {
        this.#play();
      }
    }
    disconnectedCallback() {
      this.#pause();
    }
    attributeChangedCallback(name, _, newValue) {
      if (name === "autoplay") {
        newValue === null ? this.#pause() : this.#play();
      }
    }
    get columns() {
      const columns = getComputedStyle(this.#slideshow).getPropertyValue("--columns");
      return columns;
    }
    /**
     * @typedef {{current: number, start?: boolean, end?: boolean}} Slide
     */
    /**
     * @param {boolean} reset
     * @returns {Slide}
     */
    nextSlide(reset) {
      const newSlide = this.#currentSlide + 1;
      const length = this.#slideshow.children.length - (this.columns - 1);
      if (newSlide > length) {
        if (reset) this.#currentSlide = 2;
        return { current: length - 1, start: false, end: null };
      }
      ;
      const currentSlide = this.querySelector(`.slideshow-slide:nth-child(${newSlide})`);
      this.#slideshow.scrollLeft = currentSlide.offsetLeft - this.#slideshow.offsetLeft;
      this.#currentSlide = newSlide;
      return { current: newSlide - 1, start: false, end: newSlide === length };
    }
    /**
     * @returns {Slide}
     */
    previousSlide() {
      const newSlide = this.#currentSlide - 1;
      if (newSlide < 2) {
        return { current: 1, start: null, end: false };
      }
      ;
      const currentSlide = this.querySelector(`.slideshow-slide:nth-child(${newSlide})`);
      this.#slideshow.scrollLeft = currentSlide.offsetLeft - this.#slideshow.offsetLeft;
      this.#currentSlide = newSlide;
      return { current: newSlide - 1, start: newSlide === 2, end: false };
    }
    #play() {
      clearInterval(this.#interval);
      this.#interval = setInterval(this.nextSlide.bind(this, true), 3e3);
    }
    #pause() {
      clearInterval(this.#interval);
    }
  };
  customElements.define("custom-slideshow", CustomSlideshow);
  document.addEventListener("alpine:init", () => {
    function hasError(response) {
      return "error" in response;
    }
    const database = firestore;
    class FormController {
      /**
       * @type {HTMLFormElement}
       * @private
       */
      #form = null;
      /**
       * @type {number}
       * @private
       */
      #maxFiles;
      /**
       * @type {ReviewImage[]}
       * @private
       */
      #images;
      /**
       * @type {Review}
       * @private
       */
      #fields = { stars: 0, single: true };
      /**
       * @type {boolean}
       * @readonly
       */
      submitted = false;
      constructor() {
        this.#maxFiles = parseInt(document.querySelector("#images-per-review").value);
        this.reload();
      }
      reload() {
        this.#form = document.querySelector("#review-form");
      }
      /**
       * @returns {Review}
       * @private
       */
      #data() {
        const { author, text } = Object.fromEntries(new FormData(this.#form));
        const options = { year: "numeric", month: "long", day: "numeric" };
        const datetime = new Intl.DateTimeFormat("es", options);
        const date = datetime.format(/* @__PURE__ */ new Date());
        const review = { author, text, ...this.#fields, images: this.#images, date };
        return review;
      }
      /**
       * @param {number} value
       */
      set stars(value) {
        this.#fields.stars = value;
      }
      /**
       * @param {any} file
       * @returns {Promise<ReviewImage>}
       * @private
       */
      #loadImage(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            reader.onload = null;
            const image = new Image();
            image.onload = () => {
              image.onload = null;
              const loadedImage = {
                src: image.src,
                width: image.width,
                height: image.height,
                aspectRatio: image.width / image.height,
                srcset: `${image.src} 300w, ${image.src} 500w, ${image.src} 750w, ${image.src} 900w`
              };
              resolve(loadedImage);
            };
            image.onerror = reject;
            image.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      /**
       * @param {Event} event
       * @returns {Promise<ReviewImage[]>}
       */
      async uploadImages(event) {
        const files = event.target.files;
        if (!files.length) return;
        if (files.length > this.#maxFiles) {
          alert(`Solo pueden subirse ${this.#maxFiles} archivo(s)`);
          return;
        }
        const promises = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 2097152) {
            alert("Uno de los archivos es muy grande, maximo 2MB");
            return;
          }
          promises.push(this.#loadImage(files[i]));
        }
        this.#images = await Promise.all(promises);
        return [...this.#images];
      }
      /**
       * @param {number} index
       */
      deleteImage(index) {
        this.#images.splice(index, 1);
        this.#fields.single = this.#images.length === 1;
        if (!this.#images.length) {
          const file = this.#form.querySelector("input[type='file']");
          file.value = "";
        }
      }
      submit() {
        const review = this.#data();
        this.#fields = { stars: 0, single: false };
        this.#images = [];
        this.#form.reset();
        this.submitted = true;
        return review;
      }
    }
    const form = new FormController();
    class DialogController {
      /**
       * @type {HTMLElement}
       * @private
       */
      #dialog;
      /**
       * @type {HTMLElement}
       * @private
       */
      #mainSelector;
      /**
       * @type {HTMLElement}
       * @private
       */
      #secondarySelector;
      /**
       * @type {any}
       * @private
       */
      #mainSelectorListener;
      /**
       * @type {any}
       * @private
       */
      #secondarySelectorListener;
      constructor() {
        this.#mainSelectorListener = this.#mainSelectorHandler.bind(this);
        this.#secondarySelectorListener = this.#secondarySelectorHandler.bind(this);
        this.reload();
      }
      reload() {
        this.#dialog = document.querySelector("#reviews-dialog");
        const [mainSelector, secondarySelector] = document.querySelectorAll("variant-selects");
        this.#mainSelector = mainSelector;
        this.#secondarySelector = secondarySelector;
        this.#setupVariants();
      }
      show() {
        this.#dialog.showModal();
      }
      hide() {
        this.#dialog.close();
      }
      /**
       * @param {Event} e
       * @private
       */
      #mainSelectorHandler(e) {
        const mainInputs = this.#mainSelector.querySelectorAll("input");
        const secondaryInputs = this.#secondarySelector.querySelectorAll("input");
        const index = [...mainInputs].indexOf(e.target);
        secondaryInputs[index].checked = true;
      }
      /**
       * @param {Event} e
       * @private
       */
      #secondarySelectorHandler(e) {
        e.stopImmediatePropagation();
        const mainInputs = this.#mainSelector.querySelectorAll("input");
        const secondaryInputs = this.#secondarySelector.querySelectorAll("input");
        const index = [...secondaryInputs].indexOf(e.target);
        mainInputs[index].click();
      }
      /**
       * @private
       */
      #setupVariants() {
        this.#mainSelector.removeEventListener("change", this.#mainSelectorListener);
        this.#mainSelector.addEventListener("change", this.#mainSelectorListener);
        this.#secondarySelector.removeEventListener("change", this.#secondarySelectorListener);
        this.#secondarySelector.addEventListener("change", this.#secondarySelectorListener);
      }
    }
    const modal = new DialogController();
    class State {
      /**
       * @type {Database}
       * @private
       */
      #database;
      /**
       * @type {boolean}
       * @private
       */
      #fetched = false;
      /**
       * @type {boolean}
       */
      active;
      /**
       * @type {boolean}
       */
      exists;
      /**
       * @type {string}
       */
      country;
      /**
       * @type {Rating}
       * @private
       */
      #rating = { average: "0.0", individuals: [{ v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }] };
      /**
       * @type {Review[]}
       * @private
       */
      #defaultReviews = [
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
      /**
       * @type {ReviewImage[]}
       * @private
       */
      #images = [];
      /**
       * @type {number}
       * @private
       */
      #imagesPerReview;
      /**
       * @type {Review[]}
       * @private
       */
      #reviews = [];
      /**
       * @type {Review}
       */
      lastExpanded;
      /**
       * @param {Database} database
       */
      constructor(database2) {
        this.#database = database2;
        const images = JSON.parse(document.querySelector("#reviews-media").textContent);
        if (!images) return;
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          image.srcset = `${image.src}&width=300 300w, ${image.src}&width=500 500w, ${image.src}&width=750 750w, ${image.src}&width=900 900w`;
          image.src = `${image.src}&width=900`;
          delete image.preview_image;
        }
        this.#imagesPerReview = parseInt(document.querySelector("#images-per-review").value);
        this.#images = images;
      }
      /**
       * @returns {Promise<void>}
       */
      async init() {
        await this.#fetchReviews();
      }
      /**
       * @param {Review} review
       */
      add(review) {
        this.#reviews.unshift(review);
      }
      /**
       * @param {number} index
       */
      remove(index) {
        this.#reviews.splice(index, 1);
      }
      rate() {
        const reviews = this.#reviews;
        const weight = 0.05;
        let sum = 0;
        const starsAcc = [0, 0, 0, 0, 0];
        const now = /* @__PURE__ */ new Date();
        const dayinMillis = 864e5;
        const options = { year: "numeric", month: "long", day: "numeric" };
        const datetime = new Intl.DateTimeFormat("es", options);
        for (let i = 0; i < reviews.length; i++) {
          const randomTime = Math.floor(Math.random() * 11) * dayinMillis;
          const date = new Date(now.getTime() - randomTime);
          reviews[i].date = datetime.format(date);
          const stars = Math.random() < weight ? 4 : 5;
          reviews[i].stars = stars;
          starsAcc[stars - 1] = starsAcc[stars - 1] + 1;
          sum = sum + stars;
        }
        for (let i = 0; i < 5; i++) {
          const v = starsAcc[i];
          const p = v / reviews.length * 100;
          this.#rating.individuals[i] = { v, p };
        }
        const average = sum / reviews.length;
        this.#rating.average = average.toFixed(1);
      }
      date() {
        const reviews = this.#reviews;
        const now = /* @__PURE__ */ new Date();
        const dayinMillis = 864e5;
        const options = { year: "numeric", month: "long", day: "numeric" };
        const datetime = new Intl.DateTimeFormat("es", options);
        for (let i = 0; i < reviews.length; i++) {
          const randomTime = Math.floor(Math.random() * 11) * dayinMillis;
          const date = new Date(now.getTime() - randomTime);
          reviews[i].date = datetime.format(date);
        }
      }
      /**
       * @returns {Rating}
       */
      get rating() {
        return structuredClone(this.#rating);
      }
      /**
       * @returns {Review[]}
       */
      get reviews() {
        return structuredClone(this.#reviews);
      }
      /**
       * @returns {Review[]}
       */
      get raw() {
        const reviews = structuredClone(this.#reviews);
        const raw = [];
        for (let i = 0; i < reviews.length; i++) {
          const { author, text } = reviews[i];
          raw.push({ author, text });
        }
        return raw;
      }
      /**
       * @param {Review[]} value
       */
      set reviews(value) {
        this.#reviews = structuredClone(value);
        const chunks = [];
        for (let i = 0; i < this.#images.length; i += this.#imagesPerReview) {
          const chunk = this.#images.slice(i, i + this.#imagesPerReview);
          chunks.push(chunk);
        }
        for (let i = 0; i < chunks.length; i++) {
          this.#reviews[i].images = chunks[i];
          if (chunks[i].length === 1) {
            this.#reviews[i].single = true;
          }
        }
        this.rate();
      }
      /**
       * @param {string[]} value
       */
      set names(value) {
        for (let i = 0; i < Math.min(value.length, this.#reviews.length); i++) {
          this.#reviews[i].author = value[i];
        }
      }
      /**
       * @returns {Promise<void>}
       * @private
       */
      async #fetchReviews() {
        if (!this.#fetched) {
          const storeId = document.querySelector("#store-id").value;
          const productId = document.querySelector("#product-id").value;
          const response = await this.#database.reviews(storeId, productId);
          if (hasError(response)) {
            this.error = response.error;
            throw new Error(this.error);
          }
          let reviews = response.reviews;
          if (!response.exists) {
            reviews = this.#defaultReviews;
          }
          this.active = response.active;
          this.exists = response.exists;
          this.country = response.country;
          this.reviews = reviews;
          this.#fetched = true;
        }
      }
    }
    const state = new State(database);
    function refresh() {
      form.reload();
      modal.reload();
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:load", refresh);
    }
    ;
    Alpine.data("scroll", () => ({
      reviews: { current: 1, start: true, end: false },
      dialog: { current: 1, start: true, end: false },
      nextReviewSlide() {
        this.reviews = this.$el.closest("custom-slideshow").nextSlide();
      },
      previousReviewSlide(e) {
        this.reviews = this.$el.closest("custom-slideshow").previousSlide();
      },
      nextDialogSlide() {
        this.dialog = this.$el.closest("custom-slideshow").nextSlide();
      },
      previousDialogSlide(e) {
        this.dialog = this.$el.closest("custom-slideshow").previousSlide();
      }
    }));
    Alpine.data("form", () => ({
      images: [],
      single: true,
      submitted: false,
      lastStar: null,
      async uploadImages(e) {
        try {
          const images = await form.uploadImages(e);
          this.single = images.length === 1;
          this.images = images;
        } catch (error) {
          alert(error);
        }
      },
      deleteImage(index) {
        this.images.splice(index, 1);
        this.single = this.images.length === 1;
        form.deleteImage(index);
      },
      rate(index) {
        form.stars = index + 1;
        this.lastStar?.classList?.remove("active");
        this.$el.classList.add("active");
        this.lastStar = this.$el;
      },
      submit() {
        const review = form.submit();
        this.$dispatch("form-submitted", review);
        this.lastStar?.classList?.remove("active");
        this.submitted = true;
      }
    }));
    Alpine.data("aiReviews", () => ({
      async init() {
        this.$watch("reviews", (value) => {
          if (!value?.length) return;
        });
        this.$watch("success", (value) => {
          if (value) this.$dispatch("toggle-collapsible", { id: "1" });
        });
        this.$watch("error", (value) => {
          if (value) this.$dispatch("toggle-collapsible", { id: "1" });
        });
        try {
          await state.init();
          this.country = state.country;
          this.reviews = state.reviews;
          this.rating = state.rating;
        } catch (error) {
          console.error(error);
          this.error = error;
        } finally {
          this.loading = false;
          this.initialized = false;
        }
      },
      reviews: [],
      rating: state.rating,
      expandedReview: state.lastExpanded,
      country: state.country,
      initialized: true,
      loading: true,
      success: null,
      error: null,
      expand(review) {
        if (review) {
          state.lastExpanded = review;
          this.expandedReview = review;
          modal.show();
        } else {
          modal.hide();
          this.expandedReview = null;
        }
      },
      reset() {
        this.loading = true;
        this.$dispatch("toggle-collapsible", { id: "1" });
        setTimeout(() => {
          this.success = null;
          this.error = null;
        }, 300);
      },
      async saveReviews() {
        if (this.loading) return;
        this.reset();
        const form2 = Object.fromEntries(new FormData(this.$el));
        const body = {
          storeId: form2.storeId,
          product: {
            id: form2.productId,
            name: form2.productName,
            reviews: state.raw
          }
        };
        try {
          const response = await fetch(
            "https://api.velkamhell-aireviews.com/reviews",
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
      },
      async generateReviews() {
        if (this.loading) return;
        try {
          const form2 = Object.fromEntries(new FormData(this.$el));
          if (!form2.prompt) {
            throw new Error("Debes incluir una descripcion del producto");
          }
          ;
          this.reset();
          const response = await fetch(
            `https://api.velkamhell-aireviews.com/reviews/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...form2, country: state.country })
            }
          );
          const json = await response.json();
          if (!json.ok) {
            const error = json.error;
            throw new Error(error?.message ?? error);
          }
          state.reviews = json.reviews;
          this.reviews = state.reviews;
          this.success = { message: "Rese\xF1as generadas exitosamente." };
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async generateNames() {
        if (this.loading) return;
        this.reset();
        const form2 = Object.fromEntries(new FormData(this.$el));
        try {
          const response = await fetch(
            `https://api.velkamhell-aireviews.com/utils/names`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...form2, country: state.country })
            }
          );
          const json = await response.json();
          if (!json.ok) {
            const error = json.error;
            throw new Error(error?.message ?? error);
          }
          state.names = json.names;
          this.reviews = state.reviews;
          this.success = { message: "Nombres generadas exitosamente." };
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      generateStars() {
        state.rate();
        this.reviews = state.reviews;
        this.rating = state.rating;
      },
      addReview(review) {
        state.add(review);
        this.reviews.unshift(review);
      },
      removeReview(index) {
        state.remove(index);
        this.reviews.splice(index, 1);
      }
    }));
  });
})();
