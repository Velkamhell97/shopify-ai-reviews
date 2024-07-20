(() => {
  // src/ai-reviews.js
  function hasError(response) {
    return "message" in response;
  }
  var CollapsibleElement = class extends HTMLElement {
    /**
     * @type {HTMLElement | null}
     */
    control;
    get expanded() {
      return this.getAttribute("expanded") !== null;
    }
    constructor() {
      super();
    }
    connectedCallback() {
      this.setup();
    }
    setup() {
      const controlid = this.getAttribute("control");
      if (controlid) {
        this.control = document.querySelector(`#${controlid}`);
        this.control.addEventListener("click", this.toggle.bind(this));
      }
    }
    expand() {
      this.setAttribute("expanded", "");
    }
    collapse() {
      this.removeAttribute("expanded");
    }
    toggle() {
      this.toggleAttribute("expanded", !this.expanded);
    }
  };
  customElements.define("collapsible-element", CollapsibleElement);
  var SliderElement = class extends HTMLElement {
    /**
     * @type {SliderElement}
     */
    state = { current: 1, start: true, end: false };
    /**
     * @type {number | null}
     */
    interval = null;
    /**
     * @type {Element}
     */
    slider;
    /**
     * @type {Element[]}
     */
    slides;
    /**
     * @type {MutationObserver}
     */
    observer;
    /**
     * @type {Element}
     */
    previousControl = document.createElement("button");
    /**
     * @type {Element}
     */
    nextControl = document.createElement("button");
    get type() {
      return this.getAttribute("type") ?? "manual";
    }
    get autoplay() {
      return this.type === "auto";
    }
    get maxLength() {
      const columns = parseInt(getComputedStyle(this).getPropertyValue("--slider-columns"));
      return this.slides.length - columns;
    }
    get length() {
      return this.slides.length;
    }
    constructor() {
      super();
    }
    connectedCallback() {
      this.slider = this.querySelector(".reviews-slider");
      this.slides = [...this.slider.children];
      if (this.autoplay) this.play();
      this.setup();
      this.createObserver();
    }
    disconnectedCallback() {
      this.observer.disconnect();
      this.pause();
    }
    setup() {
      const previouscontrolid = this.getAttribute("previouscontrol");
      if (previouscontrolid) this.previousControl = document.querySelector(`#${previouscontrolid}`);
      this.previousControl.addEventListener("click", this.previous.bind(this));
      this.previousControl.disabled = true;
      const nextcontrolid = this.getAttribute("nextcontrol");
      if (nextcontrolid) this.nextControl = document.querySelector(`#${nextcontrolid}`);
      this.nextControl.addEventListener("click", this.next.bind(this));
    }
    createObserver() {
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            console.log(`entre: ${this.slider.children}`);
            this.slides = [...this.slider.children];
          }
        }
      });
      this.observer.observe(this.slider, { childList: true });
    }
    reset() {
      this.state = { current: 1, start: true, end: false };
    }
    /**
     * @param {number} index
    */
    scrollTo(index) {
      let newSlide = index;
      const maxSlide = this.maxLength;
      if (newSlide < 1) return this.state;
      if (newSlide > maxSlide) {
        if (!this.autoplay) return this.state;
        newSlide = 1;
      }
      const start = newSlide === 1;
      const end = newSlide === maxSlide;
      this.previousControl.disabled = start;
      this.nextControl.disabled = end;
      console.log(newSlide);
      console.log(this.slider);
      console.log(this.slides);
      const slide = this.slides[newSlide];
      this.slider.scrollLeft = slide.offsetLeft - this.slider.offsetLeft;
      this.state = { current: newSlide, start, end };
      this.dispatchEvent(new CustomEvent("slidechange", { detail: this.state }));
    }
    next() {
      this.scrollTo(this.state.current + 1);
    }
    previous() {
      this.scrollTo(this.state.current - 1);
    }
    play() {
      clearInterval(this.interval);
      this.interval = setInterval(this.next.bind(this), 3e3);
    }
    pause() {
      clearInterval(this.interval);
    }
  };
  customElements.define("slider-element", SliderElement);
  var SliderPaginatorElement = class extends HTMLElement {
    /**
     * @type {SliderState}
     */
    state;
    /**
     * @type {SliderElement}
     */
    slider;
    /**
     * @type {HTMLElement}
     */
    paginator;
    /**
     * @type {HTMLElement[] | null}
     */
    indicators;
    get type() {
      return this.getAttribute("type") ?? "text";
    }
    constructor() {
      super();
    }
    connectedCallback() {
      this.paginator = this.querySelector(".reviews-slider-paginator");
      console.log(this.paginator);
      if (this.type === "text") {
        this.paginator.textContent = `0 / 0`;
      } else {
        this.indicators = [...this.paginator.children];
      }
      const sliderid = this.getAttribute("slider");
      if (sliderid) {
        this.slider = document.querySelector(`${sliderid}`);
        this.slider?.addEventListener("slidechange", this.onSliderChange.bind(this));
      }
    }
    onSliderChange(e) {
      const state = e.detail;
      console.log(state);
      if (this.type === "text") {
        this.paginator.textContent = `${state.current} / ${this.slider?.length ?? 0}`;
      } else {
      }
    }
  };
  customElements.define("slider-paginator-element", SliderPaginatorElement);
  var FormController = class {
    /**
     * @type {HTMLFormElement}
     */
    form;
    /**
     * @type {number}
     */
    maxFiles;
    /**
     * @type {ReviewMedia[]}
     */
    media;
    /**
     * @type {Review}
     */
    fields = { stars: 1, single: false };
    /**
     * @type {boolean}
     */
    submitted = false;
    constructor() {
      this.maxFiles = 3;
      this.reload();
    }
    reload() {
      this.form = document.querySelector("#review-form");
    }
    /**
     * @returns {Review?}
     */
    get data() {
      if (!this.form) return null;
      const options = { year: "numeric", month: "long", day: "numeric" };
      const datetime = new Intl.DateTimeFormat("es", options);
      const date = datetime.format(/* @__PURE__ */ new Date());
      const { author, description } = Object.fromEntries(new FormData(this.form));
      const review = { author, description, ...this.fields, media: this.media, date };
      return review;
    }
    /**
     * @param {number} value
     */
    set stars(value) {
      this.fields.stars = value;
    }
    /**
     * @param {Event} event
     * @returns {Promise<ReviewMedia[]>}
     */
    async uploadMedia(event) {
      const files = event.target.files;
      if (!files.length) return [];
      if (files.length > this.maxFiles) {
        alert(`Solo pueden subirse ${this.maxFiles} archivo(s)`);
        return [];
      }
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 4 * 1024 * 1024) {
          alert("Uno de los archivos es muy grande, m\xE1ximo 4MB");
          return [];
        }
        if (files[i].type.startsWith("image/")) {
          promises.push(this.loadImage(files[i]));
        } else if (files[i].type.startsWith("video/")) {
          promises.push(this.loadVideo(files[i]));
        } else {
          alert("Solo puedes cargar imagenes o videos");
          return [];
        }
      }
      this.media = await Promise.all(promises);
      this.fields.single = this.media.length === 1;
      return [...this.media];
    }
    /**
     * @param {number} index
     */
    deleteMedia(index) {
      const sources = this.media[index].sources;
      if (sources) {
        URL.revokeObjectURL(sources[0].url);
      }
      this.media.splice(index, 1);
      this.fields.single = this.media.length === 1;
      if (!this.media.length) {
        const file = this.form?.querySelector("input[type='file']");
        if (file) file.value = "";
      }
    }
    /**
     * @returns {Review?}
     */
    submit() {
      const review = this.data;
      this.fields = { stars: 1, single: false };
      this.media = [];
      this.form?.reset();
      if (review) {
        this.submitted = true;
      }
      return review;
    }
    /**
     * @param {any} file
     * @returns {Promise<ReviewMedia>}
     */
    loadImage(file) {
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
     */
    loadVideo(file) {
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
  };
  var form = new FormController();
  var DialogController = class {
    /**
     * @type {HTMLDialogElement}
     */
    dialog;
    /**
     * @type {any}
     */
    dialogCloseListener;
    /**
     * @type {SliderElement}
     */
    slider;
    /**
     * @type {HTMLElement}
     */
    mainVariantSelector;
    /**
     * @type {HTMLElement}
     */
    secondaryVarianSelector;
    /**
     * @type {any}
     */
    mainVariantSelectorChangeListener;
    /**
     * @type {any}
     */
    secondaryVariantSelectorChangeListener;
    constructor() {
      this.dialogCloseListener = this.onDialogClose.bind(this);
      this.mainVariantSelectorChangeListener = this.onMainVariantSelectorChange.bind(this);
      this.secondaryVariantSelectorChangeListener = this.onSecondaryVariantSelectorChange.bind(this);
      this.reload();
    }
    reload() {
      this.dialog = document.querySelector("#reviews-dialog");
      this.slider = document.querySelector("#dialog-slider");
      const [mainSelector, secondarySelector] = document.querySelectorAll("variant-selects");
      this.mainVariantSelector = mainSelector;
      this.secondaryVarianSelector = secondarySelector;
      this.setup();
    }
    setup() {
      this.dialog?.removeEventListener("close", this.dialogCloseListener);
      this.dialog?.addEventListener("close", this.dialogCloseListener);
      if (!this.mainVariantSelector || !this.secondaryVarianSelector) {
        console.info("DialogController -> setupVariants() -> Any variant picker found");
        return;
      }
      this.mainVariantSelector.removeEventListener("change", this.mainVariantSelectorChangeListener);
      this.mainVariantSelector.addEventListener("change", this.mainVariantSelectorChangeListener);
      this.secondaryVarianSelector.removeEventListener("change", this.secondaryVariantSelectorChangeListener);
      this.secondaryVarianSelector.addEventListener("change", this.secondaryVariantSelectorChangeListener);
    }
    /**
     * @param {number} index
     */
    show(index) {
      console.log(index);
      this.dialog?.showModal();
      setTimeout(() => {
        this.slider?.scrollTo(index + 1);
      }, 3e3);
    }
    hide() {
      this.dialog?.close();
    }
    onDialogClose() {
      this.slider?.reset();
    }
    /**
     * @param {Event} e
     */
    onMainVariantSelectorChange(e) {
      const mainInputs = this.mainVariantSelector.querySelectorAll("input");
      const secondaryInputs = this.secondaryVarianSelector.querySelectorAll("input");
      const index = [...mainInputs].indexOf(e.target);
      secondaryInputs[index].checked = true;
    }
    /**
     * @param {Event} e
     */
    onSecondaryVariantSelectorChange(e) {
      e.stopImmediatePropagation();
      const mainInputs = this.mainVariantSelector.querySelectorAll("input");
      const secondaryInputs = this.secondaryVarianSelector.querySelectorAll("input");
      const index = [...secondaryInputs].indexOf(e.target);
      mainInputs[index].click();
    }
  };
  var modal = new DialogController();
  var State = class {
    /**
     * @type {Database}
     */
    database;
    /**
     * @type {CollapsibleElement}
     */
    collapsible;
    /**
     * @type {boolean}
     */
    fetched = false;
    /**
     * @type {string}
     */
    country = "CO";
    /**
     * @type {number}
     */
    chunk = 5;
    /**
     * @type {number}
     */
    page = 1;
    /**
     * @type {Rating}
     */
    _rating = { average: "0.0", individuals: [{ v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }, { v: 0, p: 0 }] };
    /**
     * @type {Review[]}
     */
    defaultReviews = [
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
     */
    media = [];
    /**
     * @type {number[]}
     */
    pattern;
    /**
     * @type {Review[]}
     */
    _reviews = [];
    /**
     * @param {Database} database
     */
    constructor(database) {
      this.database = database;
      this.init();
      this.reload();
    }
    init() {
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
      this.media = media;
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
      this.pattern = pattern;
    }
    reload() {
      this.collapsible = document.querySelector("#request-collapsible");
      const reviewsPerPage = parseInt(document.querySelector("#reviews-per-page").value);
      if (reviewsPerPage !== this.chunk) this.page = 1;
      this.chunk = reviewsPerPage;
    }
    /**
     * @returns {Review[]}
     */
    get reviews() {
      return structuredClone(this._reviews);
    }
    /**
     * @param {string[]} value
     */
    set reviews(value) {
      const reviews = [];
      const diff = value.length - this._reviews.length;
      for (let i = 0; i < Math.min(value.length, this._reviews.length); i++) {
        const author = this._reviews[i].author;
        reviews.push({ author, description: value[i] });
      }
      if (diff > 0) {
        for (let i = value.length - diff; i < value.length; i++) {
          reviews.push({ description: value[i] });
        }
      }
      this._reviews = reviews;
      this.group();
      this.rate();
      this.date();
    }
    /**
     * @returns {Rating}
     */
    get rating() {
      return structuredClone(this._rating);
    }
    /**
     * @returns {Review[]}
     */
    get raw() {
      const reviews = structuredClone(this._reviews);
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
    set names(value) {
      for (let i = 0; i < Math.min(value.length, this._reviews.length); i++) {
        this._reviews[i].author = value[i];
      }
    }
    /**
     * @param {Review} review
     */
    add(review) {
      this._reviews.unshift(review);
      this.rate(true);
    }
    /**
     * @param {number} index
     */
    remove(index) {
      this._reviews.splice(index, 1);
      this.rate(true);
    }
    group() {
      if (!this.media.length) {
        return;
      }
      const reviews = this._reviews;
      const chunks = [];
      const last = this.pattern[this.pattern.length - 1];
      let acc = 0;
      for (let i = 0; i < this.pattern.length - 1; i++) {
        const chunk = this.media.slice(acc, acc + this.pattern[i]);
        chunks.push(chunk);
        acc += this.pattern[i];
      }
      for (let i = acc; i < this.media.length; i += last) {
        const chunk = this.media.slice(i, i + last);
        chunks.push(chunk);
      }
      for (let i = 0; i < Math.min(reviews.length, chunks.length); i++) {
        reviews[i].media = chunks[i];
        reviews[i].single = chunks[i].length === 1;
      }
    }
    /**
     * @param {boolean} keepOld
     */
    rate(keepOld) {
      const reviews = this._reviews;
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
        this._rating.individuals[i] = { v, p };
      }
      const average = sum / reviews.length;
      this._rating.average = average.toFixed(1);
    }
    date() {
      const reviews = this._reviews;
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
     * @returns {Promise<void>}
     */
    async fetchReviews() {
      if (!this.fetched) {
        const storeId = document.querySelector("#store-id").value;
        const productId = document.querySelector("#product-id").value;
        const response = await this.database.reviews(storeId, productId);
        if (hasError(response)) {
          throw response;
        }
        let reviews = response.reviews;
        if (!response.exists) {
          reviews = this.defaultReviews;
        }
        this.country = response.country;
        this._reviews = reviews;
        this.group();
        this.rate(true);
        this.date();
        this.fetched = true;
      }
    }
  };
  document.addEventListener("alpine:init", () => {
    const database = firestore;
    const state = new State(database);
    function refresh() {
      form.reload();
      modal.reload();
      state.reload();
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:load", refresh);
    }
    ;
    Alpine.data("form", () => ({
      media: [],
      single: true,
      submitted: false,
      lastStar: null,
      async uploadMedia(e) {
        try {
          const media = await form.uploadMedia(e);
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
          console.error("FormController -> submit() -> this.form is undefined");
          alert("Ocurri\xF3 un error al momento de subir la rese\xF1a. Por favor, recargue la p\xE1gina.");
          return;
        }
        this.$dispatch("form-submitted", review);
        this.submitted = true;
      }
    }));
    Alpine.data("aireviews", () => ({
      reviews: state.reviews,
      rating: state.rating,
      chunk: state.chunk,
      page: state.page,
      expandedReview: null,
      country: state.country,
      initialized: true,
      loading: true,
      success: null,
      info: null,
      error: null,
      async init() {
        this.$watch("success", (value) => {
          if (value) state.collapsible.expand();
        });
        this.$watch("error", (value) => {
          if (value) state.collapsible.expand();
        });
        try {
          await state.fetchReviews();
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
      expand(review, index) {
        if (review) {
          this.expandedReview = review;
          console.log(index);
          this.$nextTick(() => modal.show(index));
        } else {
          modal.hide();
          this.expandedReview = null;
        }
      },
      reset() {
        this.loading = true;
        if (!this.info) {
          this.info = { message: "Generando..." };
          state.collapsible.toggle();
        }
        this.error = null;
        this.success = null;
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
          this.goToPage(1);
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
      goToPage(page) {
        state.page = page;
        this.page = page;
      },
      addReview(review) {
        state.add(review);
        this.goToPage(1);
        this.reviews.unshift(review);
        this.rating = state.rating;
      },
      removeReview(i, page) {
        const index = this.chunk * (page - 1) + i;
        if (i === 0 && index === this.reviews.length - 1) {
          this.goToPage(Math.max(this.page - 1, 0));
        }
        ;
        state.remove(index);
        this.reviews.splice(index, 1);
        this.rating = state.rating;
      }
    }));
  });
})();
