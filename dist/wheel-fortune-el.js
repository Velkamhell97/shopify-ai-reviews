(() => {
  // src/wheel-fortune-el.js
  var WheelOfFortune = class extends HTMLElement {
    /**
     * @type {number} 
     */
    size;
    /**
     * @type {number[]}
     */
    discounts = [];
    /**
     * @type {number} 
     */
    angle = 0;
    /**
     * @type {number} 
     */
    step = 0;
    /**
     * @type {number} 
     */
    index = 0;
    /**
     * @type {Animation | null} 
     */
    animation = null;
    /**
     * @type {number} 
     */
    duration = 4e3;
    /**
     * @type {HTMLElement} 
     */
    wheel;
    /**
     * @type {HTMLElement} 
     */
    button;
    get offset() {
      return Math.floor(this.size / 4);
    }
    constructor() {
      super();
    }
    connectedCallback() {
      const frame = this.querySelector(".wheel-frame");
      let children = frame.children;
      frame.style.setProperty("--bullets", children.length);
      for (let i = 0; i < children.length; i++) {
        children[i].style.setProperty("--idx", i + 1);
      }
      this.wheel = this.querySelector(".wheel-board");
      children = this.wheel.children;
      this.size = children.length;
      this.step = Math.floor(360 / this.size);
      const offset = 90 % this.step;
      this.wheel.style.setProperty("--slots", this.size);
      this.wheel.style.setProperty("--offset", `${offset}deg`);
      const discounts = [];
      for (let i = 0; i < children.length; i++) {
        const slot = children[i];
        slot.style.setProperty("--idx", i + 1);
        discounts.push(parseInt(slot.dataset.value));
      }
      this.discounts = discounts;
      this.button = this.querySelector(".wheel-button");
      this.button?.addEventListener("click", this.spin.bind(this));
    }
    spin() {
      if (this.button) this.button.disabled = true;
      const half = this.step / 2;
      if (this.animation) this.animation.cancel();
      const randomAngle = Math.random() * 360;
      let newAngle = this.angle + randomAngle + 1800;
      const edgeValue = newAngle % half;
      if (edgeValue === 0) {
        newAngle -= 5;
      } else if (edgeValue > 0 && edgeValue <= 2) {
        newAngle -= 5;
      } else if (edgeValue < half && edgeValue >= half - 2) {
        newAngle += 5;
      }
      this.animation = this.wheel.animate([
        { transform: `rotate(${this.angle}deg)` },
        { transform: `rotate(${newAngle}deg)` }
      ], {
        duration: this.duration,
        direction: "normal",
        easing: "cubic-bezier(0.440, -0.205, 0.000, 1.1)",
        fill: "forwards",
        iterations: 1
      });
      const remainder = Math.floor(newAngle % 360);
      const steps = Math.floor(remainder / half);
      const slot = Math.ceil(steps / 2);
      const index = this.offset - slot;
      const discount = this.discounts.at(index);
      this.angle = newAngle;
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent("wheel-stopped", { detail: discount }));
      }, this.duration + 500);
    }
  };
  customElements.define("wheel-of-fortune", WheelOfFortune);
})();
