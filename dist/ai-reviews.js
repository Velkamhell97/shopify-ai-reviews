(() => {
  // src/ai-reviews.js
  function hasError(response) {
    return "message" in response;
  }
  var CustomCollapsible = class extends HTMLElement {
    /**
     * @type {any}
     * @private
     */
    #collapsableListenerRef;
    constructor() {
      super();
      this.#collapsableListenerRef = this.#collapsibleListener.bind(this);
    }
    /**
     * @param {Event} e
     */
    #collapsibleListener(e) {
      const { id, open } = e.detail;
      if (id !== this.getAttribute("id")) return;
      if (open) {
        this.setAttribute("open", "");
      } else {
        this.removeAttribute("open");
      }
    }
    connectedCallback() {
      if (this.getAttribute("id") !== null) {
        window.addEventListener("toggle-collapsible", this.#collapsableListenerRef);
      }
    }
    disconnectedCallback() {
      window.removeEventListener("toggle-collapsible", this.#collapsableListenerRef);
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
    reset() {
      this.#currentSlide = 2;
    }
    get columns() {
      if (!this.#slideshow) {
        console.error("CustomSlideShow -> columns getter -> this.#slideshow is undefinied");
        return 1;
      }
      ;
      const columns = getComputedStyle(this.#slideshow).getPropertyValue("--columns");
      return parseInt(columns);
    }
    /**
     * @param {number} index
     * @returns {Slide}
     */
    slideToIndex(index) {
      if (!this.#slideshow) {
        console.error("CustomSlideShow -> nextSlide() -> this.#slideshow is undefinied");
        return { current: 1, start: false, end: false };
      }
      ;
      const newSlide = index + 2;
      const currentSlide = this.querySelector(`.slideshow-slide:nth-child(${newSlide})`);
      this.#slideshow.scrollLeft = currentSlide.offsetLeft - this.#slideshow.offsetLeft;
      this.#currentSlide = newSlide;
      return { current: newSlide - 1, start: false, end: false };
    }
    /**
     * @param {boolean} reset
     * @returns {Slide}
     */
    nextSlide(reset) {
      if (!this.#slideshow) {
        console.error("CustomSlideShow -> nextSlide() -> this.#slideshow is undefinied");
        return { current: 1, start: false, end: false };
      }
      ;
      let newSlide = this.#currentSlide + 1;
      const length = this.#slideshow.children.length - (this.columns - 1);
      if (newSlide > length) {
        if (reset) {
          newSlide = 2;
        } else {
          return { current: length - 1, start: false, end: true };
        }
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
      if (!this.#slideshow) {
        console.error("CustomSlideShow -> previousSlide() -> this.#slideshow is undefinied");
        return { current: 1, start: false, end: false };
      }
      ;
      const newSlide = this.#currentSlide - 1;
      if (newSlide < 2) {
        return { current: 1, start: true, end: false };
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
  var FormController = class {
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
     * @type {ReviewMedia[]}
     * @private
     */
    #media;
    /**
     * @type {Review}
     * @private
     */
    #fields = { stars: 1, single: false };
    /**
     * @type {boolean}
     * @readonly
     */
    submitted = false;
    constructor() {
      this.#maxFiles = 3;
      this.reload();
    }
    reload() {
      this.#form = document.querySelector("#review-form");
    }
    /**
     * @returns {Review?}
     * @private
     */
    #data() {
      if (!this.#form) return null;
      const options = { year: "numeric", month: "long", day: "numeric" };
      const datetime = new Intl.DateTimeFormat("es", options);
      const date = datetime.format(/* @__PURE__ */ new Date());
      const { author, description } = Object.fromEntries(new FormData(this.#form));
      const review = { author, description, ...this.#fields, media: this.#media, date };
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
     * @returns {Promise<ReviewMedia>}
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
              local: image.src,
              src: image.src,
              width: image.width,
              height: image.height,
              aspect_ratio: image.width / image.height,
              media_type: "image",
              srcset: ""
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
     * @param {any} file
     * @returns {Promise<ReviewMedia>}
     * @private
     */
    #loadVideo(file) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);
        video.autoplay = true;
        video.muted = true;
        video.src = url;
        video.onloadeddata = () => {
          const context = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          video.pause();
          const thumbnail = canvas.toDataURL("image/png");
          const loadedVideo = {
            local: thumbnail,
            src: thumbnail,
            width: video.videoWidth,
            height: video.videoHeight,
            video_width: video.videoWidth,
            video_height: video.videoHeight,
            aspect_ratio: video.videoWidth / video.videoHeight,
            media_type: "video",
            srcset: "",
            sources: [
              {
                url,
                mime_type: file.type
              }
            ]
          };
          resolve(loadedVideo);
        };
      });
    }
    /**
     * @param {Event} event
     * @returns {Promise<ReviewMedia[]>}
     */
    async uploadFiles(event) {
      const files = event.target.files;
      if (!files.length) return [];
      if (files.length > this.#maxFiles) {
        alert(`Solo pueden subirse ${this.#maxFiles} archivo(s)`);
        return [];
      }
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 4 * 1024 * 1024) {
          alert("Uno de los archivos es muy grande, m\xE1ximo 4MB");
          return [];
        }
        if (files[i].type.startsWith("image/")) {
          promises.push(this.#loadImage(files[i]));
        } else if (files[i].type.startsWith("video/")) {
          promises.push(this.#loadVideo(files[i]));
        } else {
          alert("Solo puedes cargar imagenes o videos");
          return [];
        }
      }
      this.#media = await Promise.all(promises);
      this.#fields.single = this.#media.length === 1;
      return [...this.#media];
    }
    /**
     * @param {number} index
     */
    deleteMedia(index) {
      const sources = this.#media[index].sources;
      if (sources) {
        URL.revokeObjectURL(sources[0].url);
      }
      this.#media.splice(index, 1);
      this.#fields.single = this.#media.length === 1;
      if (!this.#media.length) {
        const file = this.#form?.querySelector("input[type='file']");
        if (file) file.value = "";
      }
    }
    /**
     * @returns {Review?}
     */
    submit() {
      const review = this.#data();
      this.#fields = { stars: 1, single: false };
      this.#media = [];
      this.#form?.reset();
      if (review) {
        this.submitted = true;
      }
      return review;
    }
  };
  var form = new FormController();
  var DialogController = class {
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
      this.#dialog?.showModal();
    }
    hide() {
      this.#dialog?.close();
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
      if (!this.#mainSelector || !this.#secondarySelector) {
        console.info("DialogController -> setupVariants() -> Any variant picker found");
        return;
      }
      this.#mainSelector.removeEventListener("change", this.#mainSelectorListener);
      this.#mainSelector.addEventListener("change", this.#mainSelectorListener);
      this.#secondarySelector.removeEventListener("change", this.#secondarySelectorListener);
      this.#secondarySelector.addEventListener("change", this.#secondarySelectorListener);
    }
  };
  var modal = new DialogController();
  var State = class {
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
      { author: "Mar\xEDa Gonz\xE1lez", stars: 5, description: "Desde que compr\xE9 este producto, he ahorrado tanto tiempo como dinero. La entrega lleg\xF3 rapid\xEDsimo y en perfectas condiciones. Es incre\xEDble c\xF3mo facilita mi d\xEDa a d\xEDa. \xA1Definitivamente vale la pena probarlo, no me arrepiento de la compra!" },
      { author: "Carlos Ram\xEDrez", stars: 4, description: "Llevaba meses buscando algo as\xED y finalmente lo encontr\xE9 aqu\xED. La atenci\xF3n al cliente fue muy buena, despejaron todas mis dudas con rapidez y profesionalismo. Muy satisfecho con la compra, es justo lo que necesitaba para resolver mi problema" },
      { author: "Laura Fern\xE1ndez", stars: 5, description: "No esperaba que este producto fuera de tanta calidad, pero ahora estoy muy satisfecha. La entrega fue r\xE1pida y sin complicaciones, lo que me dio mucha tranquilidad. Recomiendo este producto sin dudarlo, realmente super\xF3 mis expectativas iniciales." },
      { author: "Juan Mart\xEDnez", stars: 4, description: "Nunca me fiaba de comprar en estas p\xE1ginas, pero este producto me hizo cambiar de opini\xF3n. El servicio al cliente fue muy amable y eficiente. Estoy muy contento con la compra y siento que puedo confiar en este sitio para futuras compras." },
      { author: "Ana L\xF3pez", stars: 5, description: "Pens\xE9 que ser\xEDa una estafa, pero el producto lleg\xF3 en muy poco tiempo y fue tal como lo describen. Funcion\xF3 perfectamente desde el primer d\xEDa. Honestamente, estoy muy impresionado y definitivamente lo recomendar\xEDa a cualquiera." },
      { author: "Luis P\xE9rez", stars: 5, description: "Este producto ha solucionado un problema que ten\xEDa desde hace tiempo. La entrega fue incre\xEDblemente r\xE1pida y eficiente. Realmente cambi\xF3 mi rutina diaria para mejor. Muy satisfecho con la compra y siempre lo recomiendo a amigos y conocidos." },
      { author: "Marta S\xE1nchez", stars: 5, description: "Estaba buscando una soluci\xF3n a mi problema y este producto fue perfecto. El servicio al cliente fue muy servicial y atento, me ayudaron en todo momento. Lo recomiendo sin dudar, es una inversi\xF3n que realmente vale la pena." },
      { author: "Diego Rivera", stars: 5, description: "El precio me pareci\xF3 muy razonable para la calidad que ofrece. Realmente ha sido una muy buena inversi\xF3n. He notado mejoras significativas en mi rutina diaria desde que lo uso. Es definitivamente algo que recomendar\xEDa a quien busque calidad a buen precio." },
      { author: "Patricia G\xF3mez", stars: 5, description: "Es justo lo que necesitaba. La atenci\xF3n al cliente fue excelente y siempre estuvieron dispuestos a ayudar con mis dudas. Estoy muy satisfecho con mi compra y no dudar\xE9 en recomendar este producto a mis amigos y familiares." },
      { author: "Javier Torres", stars: 5, description: "Ten\xEDa mis dudas pero este producto cumpli\xF3 con todas mis expectativas. La entrega fue muy r\xE1pida, lleg\xF3 antes de lo que esperaba y sin ning\xFAn inconveniente. Estoy muy contento con la compra y lo recomendar\xEDa sin dudar." },
      { author: "Claudia Hern\xE1ndez", stars: 5, description: "Este producto ha sido de gran ayuda para mi d\xEDa a d\xEDa. La atenci\xF3n al cliente es fenomenal y resolvieron todas mis dudas inmediatamente. Lo recomiendo a quienes busquen una buena soluci\xF3n para facilitar su rutina diaria." },
      { author: "Alberto Ruiz", stars: 5, description: "No era f\xE1cil encontrar algo as\xED, pero aqu\xED lo tienen. La entrega fue sorprendentemente r\xE1pida y eficiente, lo cual agradezco mucho. Muy feliz con mi compra, el producto funciona perfectamente y cumple con todas mis expectativas." },
      { author: "Daniela Castillo", stars: 5, description: "La durabilidad de este producto es impresionante. Lo uso todos los d\xEDas y sigue como nuevo. Realmente lo recomendar\xEDa a cualquiera que busque un producto fiable y duradero. Estoy extremadamente satisfecho con mi compra." },
      { author: "Pablo Vargas", stars: 5, description: "Me sorprendi\xF3 lo r\xE1pido que lleg\xF3 el paquete y la calidad del producto. El env\xEDo fue tan r\xE1pido que no tuve que esperar nada. Estoy muy satisfecho con la compra y el producto cumple todas mis expectativas." },
      { author: "Sof\xEDa Morales", stars: 5, description: "Este producto ha sido clave para mejorar mi rutina diaria. Me ahorra mucho tiempo y esfuerzo, y la verdad es que fue una inversi\xF3n excelente. Sin duda, fue una buena compra que volver\xEDa a hacer sin pensarlo dos veces." },
      { author: "Fernando Guti\xE9rrez", stars: 5, description: "La rapidez en la entrega me sorprendi\xF3 gratamente. El producto es de buena calidad y cumple su funci\xF3n perfectamente, justo lo que necesitaba. Definitivamente lo recomendar\xEDa a quienes buscan eficiencia y calidad en un mismo producto." },
      { author: "Carolina Castro", stars: 5, description: "El producto es justo lo que necesitaba y la atenci\xF3n al cliente fue estupenda. Me ayudaron con todas mis dudas de forma r\xE1pida y efectiva. Lo recomendar\xE9 a mis amigos, estoy completamente satisfecho con mi experiencia de compra." },
      { author: "Ricardo D\xEDaz", stars: 5, description: "Hab\xEDa probado otros y ninguno como este. La calidad del producto es excelente y cumpli\xF3 con todas mis expectativas. La entrega fue muy r\xE1pida y sin problemas. \xA1Lo recomiendo a cualquiera que busque calidad y eficiencia en un solo producto!" },
      { author: "Elena Vargas", stars: 5, description: "Desde que lo tengo, he notado una mejora significativa en mis actividades diarias. La atenci\xF3n al cliente fue muy cordial y siempre estuvieron disponibles para ayudarme. Definitivamente lo recomendar\xE9, realmente ha marcado una diferencia en mi rutina." },
      { author: "Andr\xE9s Mendoza", stars: 5, description: "Este producto me ha facilitado mucho la vida. Lleg\xF3 antes de lo previsto y en perfectas condiciones. Estoy muy satisfecho con la compra y lo recomendar\xE9 sin dudas a quienes buscan soluciones pr\xE1cticas y de calidad." }
    ];
    /**
     * @type {ReviewMedia[]}
     * @private
     */
    #media = [];
    /**
     * @type {number[]}
     * @private
     */
    #pattern;
    /**
     * @type {Review[]}
     * @private
     */
    #reviews = [];
    /**
     * @param {Database} database
     */
    constructor(database) {
      this.#database = database;
      const media = JSON.parse(document.querySelector("#reviews-media").textContent);
      if (!media) return;
      for (let i = 0; i < media.length; i++) {
        const resource = media[i];
        if (resource.media_type === "image") {
          resource.srcset = `${resource.src}&width=300 300w, ${resource.src}&width=500 500w, ${resource.src}&width=750 750w, ${resource.src}&width=900 900w`;
          resource.src = `${resource.src}&width=900`;
          resource.thumbnail = `${resource.src}&width=200`;
          delete resource.preview_image;
        } else {
          resource.src = `${resource.preview_image.src}`;
          resource.thumbnail = `${resource.preview_image.src}&width=200`;
          resource.width = `${resource.preview_image.width}`;
          resource.height = `${resource.preview_image.height}`;
          resource.srcset = `${resource.src} ${resource.width}w`;
          resource.video_width = `${resource.sources[0].width}`;
          resource.video_height = `${resource.sources[0].height}`;
          delete resource.preview_image;
        }
      }
      const textPattern = document.querySelector("#media-pattern").value.replace(/ /g, "");
      let values = textPattern.split(",").map(Number);
      const pattern = [...values];
      for (let i = 0; i < values.length; i++) {
        const number = pattern[i];
        if (number > 9) {
          const parts = number.toString().split("").map(Number);
          pattern.splice(i, 1);
          for (let j = 0; j < parts.length; j++) {
            pattern.splice(i + j, 0, parts[j]);
          }
        }
      }
      this.#pattern = pattern;
      this.#media = media;
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
      this.rate(true);
    }
    /**
     * @param {number} index
     */
    remove(index) {
      this.#reviews.splice(index, 1);
      this.rate(true);
    }
    group() {
      if (!this.#media.length) {
        return;
      }
      const reviews = this.#reviews;
      const chunks = [];
      const last = this.#pattern[this.#pattern.length - 1];
      let acc = 0;
      for (let i = 0; i < this.#pattern.length - 1; i++) {
        const chunk = this.#media.slice(acc, acc + this.#pattern[i]);
        chunks.push(chunk);
        acc += this.#pattern[i];
      }
      for (let i = acc; i < this.#media.length; i += last) {
        const chunk = this.#media.slice(i, i + last);
        chunks.push(chunk);
      }
      for (let i = 0; i < chunks.length; i++) {
        reviews[i].media = chunks[i];
        reviews[i].single = chunks[i].length === 1;
      }
    }
    /**
     * @param {boolean} keepOld
     */
    rate(keepOld) {
      const reviews = this.#reviews;
      let sum = 0;
      const starsAcc = [0, 0, 0, 0, 0];
      if (keepOld) {
        for (let i = 0; i < reviews.length; i++) {
          const stars = reviews[i].stars;
          starsAcc[stars - 1] = starsAcc[stars - 1] + 1;
          sum = sum + stars;
        }
      } else {
        const weight = 0.1;
        for (let i = 0; i < reviews.length; i++) {
          const stars = Math.random() < weight ? 4 : 5;
          reviews[i].stars = stars;
          starsAcc[stars - 1] = starsAcc[stars - 1] + 1;
          sum = sum + stars;
        }
      }
      for (let i = 0; i < 5; i++) {
        const v = starsAcc[i];
        const p = Math.round(v / reviews.length * 100);
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
        const { author, description, stars } = reviews[i];
        raw.push({ author, description, stars });
      }
      return raw;
    }
    /**
     * @param {string[]} value
     */
    set reviews(value) {
      const reviews = [];
      const diff = value.length - this.#reviews.length;
      for (let i = 0; i < Math.min(value.length, this.#reviews.length); i++) {
        const author = this.#reviews[i].author;
        reviews.push({ author, description: value[i] });
      }
      if (diff > 0) {
        for (let i = value.length - diff; i < value.length; i++) {
          reviews.push({ description: value[i] });
        }
      }
      this.#reviews = reviews;
      this.group();
      this.rate();
      this.date();
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
          throw response;
        }
        let reviews = response.reviews;
        if (!response.exists) {
          reviews = this.#defaultReviews;
        }
        this.active = response.active;
        this.exists = response.exists;
        this.country = response.country;
        this.#reviews = reviews;
        this.group();
        this.rate(true);
        this.date();
        this.#fetched = true;
      }
    }
  };
  function refresh() {
    form.reload();
    modal.reload();
  }
  if (Shopify.designMode) {
    document.addEventListener("shopify:section:load", refresh);
  }
  document.addEventListener("alpine:init", () => {
    const database = firestore;
    const state = new State(database);
    let reviewsPerPage;
    Alpine.data("scroll", () => ({
      reviews: { current: 1, start: true, end: false },
      dialog: { current: 1, start: true, end: false },
      nextReviewSlide() {
        this.reviews = this.$el?.closest("custom-slideshow")?.nextSlide();
      },
      previousReviewSlide() {
        this.reviews = this.$el?.closest("custom-slideshow")?.previousSlide();
      },
      move(e) {
        const index = e.detail.index;
        if (!index) return;
        this.dialog = this.$el?.slideToIndex(index);
      },
      reset() {
        this.dialog = { current: 1, start: true, end: false };
        this.$el?.reset();
      },
      nextDialogSlide() {
        this.dialog = this.$el?.closest("custom-slideshow")?.nextSlide();
      },
      previousDialogSlide() {
        this.dialog = this.$el?.closest("custom-slideshow")?.previousSlide();
      }
    }));
    Alpine.data("form", () => ({
      media: [],
      single: true,
      submitted: false,
      lastStar: null,
      async uploadFiles(e) {
        try {
          const media = await form.uploadFiles(e);
          this.single = media.length === 1;
          this.media = media;
        } catch (error) {
          alert(error);
        }
      },
      deleteMedia(index) {
        this.media.splice(index, 1);
        this.single = this.media.length === 1;
        form.deleteMedia(index);
      },
      rate(index) {
        form.stars = index;
        this.lastStar?.classList?.remove("active");
        this.$el?.classList?.add("active");
        this.lastStar = this.$el;
      },
      submit() {
        const review = form.submit();
        this.lastStar?.classList?.remove("active");
        this.single = false, this.media = [];
        if (!review) {
          console.error("FormController -> submit() -> this.#form is undefined");
          alert("Ocurri\xF3 un error al momento de subir la rese\xF1a. Por favor, recargue la p\xE1gina.");
          return;
        }
        this.$dispatch("form-submitted", review);
        this.submitted = true;
      }
    }));
    Alpine.data("aiReviews", () => ({
      reviews: [],
      rating: state.rating,
      chunk: [],
      chunkLength: reviewsPerPage ?? 0,
      page: 1,
      pages: 0,
      expandedReview: null,
      country: state.country,
      initialized: true,
      loading: true,
      success: null,
      info: null,
      error: null,
      async init() {
        this.chunkLength = parseInt(document.querySelector("#reviews-per-page").value);
        this.$watch("success", (value) => {
          if (value) this.$dispatch("toggle-collapsible", { id: "1", open: true });
        });
        this.$watch("error", (value) => {
          if (value) this.$dispatch("toggle-collapsible", { id: "1", open: true });
        });
        try {
          await state.init();
          this.reviews = state.reviews;
          this.country = state.country;
          this.rating = state.rating;
        } catch (error) {
          console.error(error);
          this.error = error;
        } finally {
          this.loading = false;
          this.initialized = false;
        }
      },
      goToPage(page) {
        this.page = page;
      },
      expand(review, index) {
        if (review) {
          this.expandedReview = review;
          this.$nextTick(() => this.$dispatch("dialog-open", { index }));
          modal.show();
        } else {
          modal.hide();
          this.$dispatch("dialog-close");
          this.expandedReview = null;
        }
      },
      revoke(resource) {
        const url = resource.sources[0].url;
        if (url.startsWith("blob")) URL.revokeObjectURL(url);
      },
      reset() {
        this.loading = true;
        this.$dispatch("toggle-collapsible", { id: "1", open: false });
        setTimeout(() => {
          this.success = null;
          this.info = null;
          this.error = null;
        }, 300);
      },
      async saveReviews() {
        if (this.loading) return;
        if (!this.$el) {
          console.error("SaveReviews -> this.$el (form) is not defined");
          return;
        }
        this.reset();
        try {
          const form2 = Object.fromEntries(new FormData(this.$el));
          const body = {
            storeId: form2.storeId,
            product: {
              id: form2.productId,
              name: form2.productName,
              reviews: state.raw
            }
          };
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
            throw json;
          }
          this.success = { message: "Rese\xF1as guardadas exitosamente." };
        } catch (error) {
          console.error(error);
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async generateReviews() {
        if (this.loading) return;
        if (!this.$el) {
          console.error("GenerateReviews -> this.$el (form) is not defined");
          return;
        }
        try {
          const form2 = Object.fromEntries(new FormData(this.$el));
          if (!form2.description) {
            throw new Error("Debes incluir una descripci\xF3n del producto");
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
            throw json;
          }
          state.reviews = json.reviews;
          this.reviews = state.reviews;
          this.rating = state.rating;
          this.success = { message: `\xA1${json.reviews.length} rese\xF1as generadas exitosamente!. Si faltan nombres presionar el boton 'Nombres'` };
        } catch (error) {
          console.error(error);
          this.error = error;
        } finally {
          this.loading = false;
        }
      },
      async generateNames() {
        if (this.loading) return;
        if (!this.$el) {
          console.error("GenerateNames -> this.$el (form) is not defined");
          return;
        }
        this.reset();
        try {
          const form2 = Object.fromEntries(new FormData(this.$el));
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
            throw json;
          }
          state.names = json.names;
          this.reviews = state.reviews;
          this.success = { message: "\xA1Nombres generadas exitosamente!" };
        } catch (error) {
          console.error(error);
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
        this.reviews = [review, ...this.reviews];
        this.page++;
        this.rating = state.rating;
      },
      removeReview(i, page) {
        const index = reviewsPerPage * (page - 1) + i;
        state.remove(index);
        this.reviews.splice(index, 1);
        console.log(this.chunkLength);
        console.log(this.page);
        console.log(index);
        console.log(this.reviews.length);
        console.log(state.reviews.length);
        this.rating = state.rating;
      }
    }));
  });
})();
