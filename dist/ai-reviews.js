(() => {
  // src/ai-reviews.js
  document.addEventListener("alpine:init", () => {
    function hasError(response) {
      return "error" in response;
    }
    const database = firestore;
    class ScrollController {
      /**
       * @type {boolean}
       * @private
       */
      #initialized = false;
      /**
       * @type {number}
       * @private
       */
      #reviewsLength = 0;
      /**
       * @type {number}
       * @private
       */
      #currentSlide = 2;
      /**
       * @type {?number}
       * @private
       */
      #interval = null;
      /**
       * @type {HTMLElement}
       * @private
       */
      #reviewsScroll;
      /**
       * @type {any}
       * @private
       */
      #pageChangedListener;
      constructor() {
        this.#pageChangedListener = this.#pageChangedHandler.bind(this);
      }
      /**
       * @param {number} length
       * @returns {void}
       */
      init(length) {
        this.#reviewsLength = length;
        if (this.#initialized) return;
        this.reload(false);
        this.#initialized = true;
      }
      /**
       * @param {boolean} reset
       * @returns {void}
       */
      reload(reset) {
        if (reset) this.#currentSlide = 2;
        this.#reviewsScroll = document.querySelector(".reviews");
        const autoplay = document.querySelector("#scroll-type").value === "auto";
        if (autoplay) {
          this.#play();
        } else {
          this.#stop();
        }
        this.#setupControlButtons();
      }
      /**
       * @returns {number}
       */
      get rows() {
        const rows = getComputedStyle(this.#reviewsScroll).getPropertyValue("--review-rows");
        return parseInt(rows);
      }
      /**
       * @returns {number}
       */
      get maxSlide() {
        const columns = getComputedStyle(this.#reviewsScroll).getPropertyValue("--review-columns");
        return this.#reviewsLength - columns + 2;
      }
      /**
       * @param {number} slideIndex
       * @returns {void}
       * @private
       */
      #scrollToSlide(slideIndex) {
        const currentSlide = this.#reviewsScroll.querySelector(`.review-slide:nth-child(${slideIndex})`);
        this.#reviewsScroll.scrollLeft = currentSlide.offsetLeft - this.#reviewsScroll.offsetLeft;
      }
      /**
       * @returns {void}
       * @private
       */
      #play() {
        clearInterval(this.#interval);
        this.#interval = setInterval(() => {
          this.#currentSlide = this.#currentSlide + 1 + this.rows;
          if (this.#currentSlide > this.maxSlide - 1) {
            this.#currentSlide = 2;
          }
          this.#scrollToSlide(this.#currentSlide);
        }, 3e3);
      }
      /**
       * @returns {void}
       * @private
       */
      #stop() {
        clearInterval(this.#interval);
      }
      /**
       * @param {Event} e
       * @returns {void}
       * @private
       */
      #pageChangedHandler(e) {
        const button = e.target.closest("button");
        const direction = parseInt(button.dataset.direction);
        const newSlide = this.#currentSlide + direction * (this.rows + 1);
        if (newSlide < 2 || newSlide > this.maxSlide) return;
        this.#currentSlide = newSlide;
        this.#scrollToSlide(this.#currentSlide);
      }
      /**
       * @returns {void}
       * @private
       */
      #setupControlButtons() {
        const paginatorButtons = document.querySelectorAll(".reviews-paginator__button");
        paginatorButtons.forEach((button) => {
          button.removeEventListener("click", this.#pageChangedListener);
          button.addEventListener("click", this.#pageChangedListener);
        });
      }
    }
    const scroll = new ScrollController();
    class FormController {
      /**
       * @type {boolean}
       * @private
       */
      #initialized = false;
      /**
       * @type {HTMLFormElement}
       * @private
       */
      #form = null;
      /**
       * @type {Review}
       * @private
       */
      #fields = { stars: 0, image: null };
      /**
       * @type {boolean}
       * @private
       */
      #imageLoaded = false;
      /**
       * @type {boolean}
       * @readonly
       */
      submited = false;
      /**
       * @type {HTMLTemplateElement}
       * @private
       */
      #imageTemplate;
      /**
       * @type {HTMLTemplateElement}
       * @private
       */
      #buttonTemplate;
      /**
       * @type {any}
       * @private
       */
      #fileChangedListener;
      /**
       * @type {HTMLElement}
       * @private
       */
      #formFile;
      /**
       * @type {any}
       * @private
       */
      #starListener;
      /**
       * @type {Element[]}
       * @private
       */
      #formStars;
      constructor() {
        this.#fileChangedListener = this.#fileChangedHandler.bind(this);
        this.#starListener = this.#starHandler.bind(this);
      }
      /**
       * @returns {void}
       */
      init() {
        if (this.#initialized) return;
        this.reload();
        this.#initialized = true;
      }
      /**
       * @returns {void}
       */
      reload() {
        this.#form = document.querySelector("#review-form");
        this.#formFile = document.querySelector(".review-form__file");
        this.#imageTemplate = this.#formFile.querySelector("#review-form__file-template--image");
        this.#buttonTemplate = this.#formFile.querySelector("#review-form__file-template--button");
        this.#formStars = [...document.querySelector(".review-form__stars-selector").children];
        this.#formStars.shift();
        this.#setupStarsInput();
        this.#setupFileInput();
      }
      /**
       * @returns {Review}
       */
      data() {
        const { author, text } = Object.fromEntries(new FormData(this.#form));
        const options = { year: "numeric", month: "long", day: "numeric" };
        const datetime = new Intl.DateTimeFormat("es", options);
        const date = datetime.format(/* @__PURE__ */ new Date());
        const fields = { author, text, ...this.#fields, date };
        return fields;
      }
      /**
       * @param {Event} e
       * @returns {any} 
       * @private
       */
      #starHandler(e) {
        const star = e.target.closest("span");
        for (let i = 0; i < 5; i++) {
          this.#formStars[i].classList.remove("active");
        }
        const index = this.#formStars.indexOf(star);
        this.#fields.stars = index + 1;
        for (let i = 0; i < this.#fields.stars; i++) {
          this.#formStars[i].classList.add("active");
        }
      }
      /**
       * @returns {void}
       * @private
       */
      #setupStarsInput() {
        for (let i = 0; i < this.#formStars.length; i++) {
          const star = this.#formStars[i];
          star.removeEventListener("click", this.#starListener);
          star.addEventListener("click", this.#starListener);
        }
      }
      /**
       * @returns {void}
       * @private
       */
      #onImageDeleted() {
        this.#form.image = null;
        this.#imageLoaded = false;
        const formFileInput = this.#formFile.querySelector("#review-form__file-input");
        formFileInput.value = "";
        this.#formFile.querySelector(".review-form__file-content").remove();
        this.#formFile.appendChild(this.#buttonTemplate.content.cloneNode(true));
      }
      /**
       * @param {Event} event
       * @returns {void}
       * @private
       */
      #onImageLoaded(event) {
        if (this.#imageLoaded) return;
        this.#imageLoaded = true;
        const image = event.target;
        const aspectRatio = image.width / image.height;
        this.#fields.image = {
          src: image.src,
          width: image.width,
          height: image.height,
          aspectRatio,
          srcset: `${image.src} 300w, ${image.src} 500w, ${image.src} 750w, ${image.src} 900w`
        };
        this.#formFile.querySelector(".review-form__file-button--upload").remove();
        const formFileImage = this.#imageTemplate.content.cloneNode(true);
        const container = formFileImage.querySelector(".review-form__file-content");
        container.appendChild(image);
        container.firstElementChild.addEventListener("click", this.#onImageDeleted.bind(this));
        this.#formFile.appendChild(formFileImage);
      }
      /**
       * @param {Event} event
       * @returns {void}
       * @private
       */
      #fileChangedHandler(event) {
        const files = event.target.files;
        if (!files.length) return;
        const file = files[0];
        if (file.size > 2097152) {
          alert("La imagen es muy grande");
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
          const image = new Image();
          image.onload = this.#onImageLoaded.bind(this);
          image.src = reader.result;
          image.alt = "Uploaded image";
        }, false);
        reader.readAsDataURL(file);
      }
      /**
       * @returns {void}
       * @private
       */
      #setupFileInput() {
        const formFileInput = this.#formFile.querySelector("#review-form__file-input");
        formFileInput.removeEventListener("change", this.#fileChangedListener);
        formFileInput.addEventListener("change", this.#fileChangedListener);
      }
      /**
       * @returns {void}
       */
      reset() {
        for (let i = 0; i < this.#formStars.length; i++) {
          this.#formStars[i].classList.remove("active");
        }
        this.#fields = { stars: 0, image: null };
        this.#imageLoaded = false;
        this.#form.reset();
        this.#formFile.querySelector(".review-form__file-content").remove();
        this.#formFile.appendChild(this.#buttonTemplate.content.cloneNode(true));
      }
    }
    const form = new FormController();
    class DialogController {
      /**
       * @type {boolean}
       * @private
       */
      #initialized = false;
      /**
       * @type {number}
       * @private
       */
      #maxSlide = 100;
      /**
       * @type {number}
       * @private
       */
      #currentSlide = 2;
      /**
       * @type {any}
       * @private
       */
      #pageChangedListener;
      /**
       * @type {HTMLElement}
       * @private
       */
      #slideshow;
      /**
       * @type {any}
       * @private
       */
      #dialogListener;
      /**
       * @type {HTMLElement}
       * @private
       */
      #dialog;
      /**
       * @type {any}
       * @private
       */
      #mainSelectorListener;
      /**
       * @type {HTMLElement}
       * @private
       */
      #mainSelector;
      /**
       * @type {any}
       * @private
       */
      #secondarySelectorListener;
      /**
       * @type {HTMLElement}
       * @private
       */
      #secondarySelector;
      constructor() {
        this.#dialogListener = this.#dialogHandler.bind(this);
        this.#mainSelectorListener = this.#mainSelectorHandler.bind(this);
        this.#secondarySelectorListener = this.#secondarySelectorHandler.bind(this);
        this.init();
      }
      /**
       * @returns {void}
       */
      init() {
        if (this.#initialized) return;
        this.reload();
        this.#initialized = true;
      }
      /**
       * @returns {void}
       */
      reload() {
        this.#dialog = document.querySelector("#reviews-dialog");
        const [mainSelector, secondarySelector] = document.querySelectorAll("variant-selects");
        this.#mainSelector = mainSelector;
        this.#secondarySelector = secondarySelector;
        this.#setupDialog();
        this.#setupVariants();
      }
      /**
       * @returns {void}
       */
      show() {
        this.#dialog.showModal();
      }
      /**
       * @returns {void}
       */
      hide() {
        this.#dialog.close();
      }
      /**
       * @param {number} slideIndex
       * @returns {void}
       * @private
       */
      #scrollToSlide(slideIndex) {
        const currentSlide = this.#slideshow.querySelector(`.dialog-slide:nth-child(${slideIndex})`);
        this.#slideshow.scrollLeft = currentSlide.offsetLeft - this.#slideshow.offsetLeft;
      }
      /**
       * @param {Event} e
       * @returns {void}
       * @private
       */
      #pageChangedHandler(e) {
        const button = e.target.closest("button");
        const direction = parseInt(button.dataset.direction);
        const newSlide = this.#currentSlide + direction * 1;
        if (newSlide < 2 || newSlide > this.#maxSlide) return;
        this.#currentSlide = newSlide;
        this.#scrollToSlide(this.#currentSlide);
      }
      /**
       * @returns {void}
       * @private
       */
      #setupControlButtons() {
        const paginatorButtons = document.querySelectorAll(".dialog-paginator__button");
        paginatorButtons.forEach((button) => {
          button.removeEventListener("click", this.#pageChangedListener);
          button.addEventListener("click", this.#pageChangedListener);
        });
      }
      /**
       * @param {Event} e
       * @returns {void}
       * @private
       */
      #dialogHandler(e) {
        if (e.target === this.#dialog) this.#dialog.close();
      }
      /**
       * @returns {void}
       * @private
       */
      #setupDialog() {
        this.#dialog.removeEventListener("click", this.#dialogListener);
        this.#dialog.addEventListener("click", this.#dialogListener);
      }
      /**
       * @returns {void}
       * @private
       */
      #mainSelectorHandler(e) {
        const mainInputs = this.#mainSelector.querySelectorAll("input");
        const secondaryInputs = this.#secondarySelector.querySelectorAll("input");
        const index = [...mainInputs].indexOf(e.target);
        secondaryInputs[index].checked = true;
      }
      /**
       * @returns {void}
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
       * @returns {void}
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
    class DoomController {
      /**
       * @type {boolean}
       * @private
       */
      #initialized = false;
      /**
       * @type {HTMLElement}
       * @private
       */
      #infoCollapsible;
      /**
       * @type {any}
       * @private
       */
      #formCollapsibleListener;
      constructor() {
        this.#formCollapsibleListener = this.#formCollapsibleHandler.bind(this);
        this.init();
      }
      /**
       * @returns {void}
       */
      init() {
        if (this.#initialized) return;
        this.reload();
        this.#initialized = true;
      }
      /**
       * @returns {void}
       */
      reload() {
        this.#infoCollapsible = document.querySelector("#reviews-info-collapsible");
        this.#setupCollapsibles();
      }
      /**
       * @returns {void}
       */
      openCollapsible() {
        this.#infoCollapsible.dataset.open = "true";
      }
      /**
       * @returns {void}
       */
      closeCollapsible() {
        this.#infoCollapsible.dataset.open = "close";
      }
      /**
       * @param {Event} e
       * @returns {void}
       * @private
       */
      #formCollapsibleHandler(e) {
        const formCollapsibleControl = e.target.closest("button");
        const formCollapsible = formCollapsibleControl.nextElementSibling;
        if (formCollapsible.dataset.open === "true") {
          formCollapsible.dataset.open = "false";
          formCollapsibleControl.textContent = "Escribe tu valoraci\xF3n";
        } else {
          formCollapsible.dataset.open = "true";
          formCollapsibleControl.textContent = "Cerrar formulario";
        }
      }
      /**
       * @returns {void}
       * @private
       */
      #setupCollapsibles() {
        const formCollapsibleControl = document.querySelector("#reviews-form-collapsible");
        formCollapsibleControl.removeEventListener("click", this.#formCollapsibleListener);
        formCollapsibleControl.addEventListener("click", this.#formCollapsibleListener);
      }
    }
    const doom = new DoomController();
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
       * @type {boolean}
       */
      customRating;
      /**
       * @type {Review[]}
       * @private
       */
      #reviews = [];
      /**
       * @type {ReviewImage[]}
       * @private
       */
      #images = [];
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
       * @type {any}
       */
      error;
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
       * @returns {void}
       */
      add(review) {
        this.#reviews.unshift(review);
      }
      /**
       * @param {number} index
       * @returns {void}
       */
      remove(index) {
        this.#reviews.splice(index, 1);
      }
      /**
       * @param {Review[]} value
       */
      set reviews(value) {
        const reviews = structuredClone(value);
        const imagesPerReview = document.querySelector("#images-per-review").value ?? 1;
        console.log(imagesPerReview);
        for (let i = 0; i < this.#images.length; i += imagesPerReview) {
          const chunk = this.#images.slice(i, i + imagesPerReview);
          reviews[i].images = chunk;
        }
        const now = /* @__PURE__ */ new Date();
        const dayinMillis = 864e5;
        const options = { year: "numeric", month: "long", day: "numeric" };
        const datetime = new Intl.DateTimeFormat("es", options);
        const weight = 0.05;
        for (let i = 0; i < reviews.length; i++) {
          const randomTime = Math.floor(Math.random() * 11) * dayinMillis;
          const date = new Date(now.getTime() - randomTime);
          const stars = Math.random() < weight ? 4 : 5;
          reviews[i].date = datetime.format(date);
          reviews[i].stars = stars;
        }
        this.customRating = "unlocked";
        this.#reviews = reviews;
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
       * @returns {Review[]}
       */
      get reviews() {
        return this.#reviews;
      }
      /**
       * @returns {Review[]}
       */
      get copy() {
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
      /**
       * @returns {void}
       */
      rate() {
        const weight = 0.05;
        for (let i = 0; i < this.#reviews.length; i++) {
          const stars = Math.random() < weight ? 4 : 5;
          this.#reviews[i].stars = stars;
        }
        this.customRating = "locking";
      }
    }
    const state = new State(database);
    let formReload = false;
    let scrollReload = false;
    function refresh() {
      formReload = true;
      scrollReload = true;
      doom.reload();
      modal.reload();
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:load", refresh);
    }
    ;
    Alpine.data("aiReviews", () => ({
      async init() {
        this.$nextTick(() => {
          form.init();
          if (formReload) {
            formReload = false;
            form.reload();
          }
        });
        this.$watch("initialized", () => {
          if (!this.initialized && scrollReload) {
            scrollReload = false;
            scroll.reload(true);
          }
        });
        this.$watch("reviews", () => {
          const reviews = this.reviews;
          if (!reviews.length) return;
          if (state.customRating !== "locked") {
            this.calculateRating(reviews);
          }
          if (state.customRating === "locking") {
            state.customRating = "locked";
          }
          scroll.init(reviews.length);
        });
        this.$watch("success", (value) => {
          if (value) doom.openCollapsible();
        });
        this.$watch("error", (value) => {
          if (value) doom.openCollapsible();
        });
        try {
          await state.init();
          this.country = state.country;
          this.reviews = state.copy;
        } catch (error) {
          console.error(error);
          this.error = error;
        } finally {
          this.loading = false;
          this.initialized = false;
        }
      },
      reviews: [],
      rating: {},
      expandedReview: null,
      country: state.country,
      submited: form.submited,
      initialized: true,
      loading: true,
      success: null,
      error: null,
      calculateRating(reviews) {
        const rating = { average: "5.0", individuals: [0, 0, 0, 0, 0] };
        let sum = 0;
        for (let i = 0; i < reviews.length; i++) {
          const stars = reviews[i].stars;
          sum = sum + stars;
          rating.individuals[stars - 1] = rating.individuals[stars - 1] + 1;
        }
        for (let i = 0; i < 5; i++) {
          const value = rating.individuals[i];
          rating.individuals[i] = { value, per: value / reviews.length * 100 };
        }
        const average = sum / reviews.length;
        rating.average = average.toFixed(1);
        this.rating = rating;
      },
      toggleDialog(selected) {
        if (selected) {
          this.expandedReview = selected;
          modal.show();
        } else {
          modal.hide();
          this.expandedReview = null;
        }
      },
      reset() {
        this.loading = true;
        doom.closeCollapsible();
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
          this.reviews = state.copy;
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
          this.reviews = state.copy;
          this.success = { message: "Nombres generadas exitosamente." };
        } catch (error) {
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      generateStars() {
        state.rate();
        this.reviews = state.copy;
      },
      addReview() {
        const review = form.data();
        state.add(review);
        this.reviews.unshift(review);
        form.reset();
        form.submited = true;
        this.submited = true;
      },
      removeReview(index) {
        this.reviews.splice(index, 1);
        state.remove(index);
      }
    }));
  });
})();
