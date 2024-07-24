(() => {
  // src/ai-reviews-el.js
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
     * @type {{current: number, start: boolean, end: false}}
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
     * @type {boolean}
     */
    autoplay;
    /**
     * @type {Element}
     */
    previousControl;
    /**
     * @type {Element}
     */
    nextControl;
    get type() {
      return this.getAttribute("type") ?? "manual";
    }
    get columns() {
      const columns = getComputedStyle(this).getPropertyValue("--slider-columns");
      return parseInt(columns);
    }
    get length() {
      return this.slider.children.length;
    }
    get maxLength() {
      return this.slider.children.length - this.columns;
    }
    constructor() {
      super();
      this.autoplay = this.type === "auto";
    }
    connectedCallback() {
      this.slider = this.querySelector(".reviews-slider");
      this.autoplay ? this.play() : this.setup();
    }
    disconnectedCallback() {
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
    reset() {
      this.slider.style.scrollBehavior = "auto";
      this.slider.scrollLeft = 0;
      this.slider.style.scrollBehavior = "smooth";
      this.state = { current: 1, start: true, end: false };
      this.dispatchEvent(new CustomEvent("slidechange", { detail: this.state }));
    }
    /**
     * @param {number} index
    */
    scrollTo(index) {
      let newSlide = index;
      const maxSlide = this.maxLength;
      if (newSlide < 1) {
        newSlide = 1;
      } else if (newSlide > maxSlide) {
        newSlide = this.autoplay && newSlide === this.length ? 1 : maxSlide;
      }
      ;
      const start = newSlide === 1;
      const end = newSlide === maxSlide;
      if (!this.autoplay) {
        this.previousControl.disabled = start;
        this.nextControl.disabled = end;
      }
      const slide = this.slider.children[newSlide];
      this.slider.scrollLeft = slide.offsetLeft - this.slider.offsetLeft;
      this.state = { current: newSlide, start, end };
      this.dispatchEvent(new CustomEvent("slidechange", { detail: this.state }));
    }
    next() {
      this.scrollTo(this.state.current + this.columns);
    }
    previous() {
      this.scrollTo(this.state.current - this.columns);
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
     * @type {SliderElement}
     */
    slider;
    /**
     * @type {HTMLElement}
     */
    paginator;
    get type() {
      return this.getAttribute("type") ?? "text";
    }
    get length() {
      return this.slider?.length ?? 1;
    }
    constructor() {
      super();
    }
    connectedCallback() {
      this.paginator = this.querySelector(".reviews-slider-paginator");
      this.setup();
    }
    setup() {
      const sliderid = this.getAttribute("slider");
      if (!sliderid) return;
      this.slider = document.querySelector(`#${sliderid}`);
      this.slider?.addEventListener("slidechange", this.onSliderChange.bind(this));
      if (this.type === "text") {
        this.paginator.textContent = `1 / ${this.length}`;
      }
    }
    onSliderChange(e) {
      const { current } = e.detail;
      if (this.type === "text") {
        this.paginator.textContent = `${current} / ${this.length - 1}`;
      } else {
      }
    }
  };
  customElements.define("slider-paginator-element", SliderPaginatorElement);
})();
