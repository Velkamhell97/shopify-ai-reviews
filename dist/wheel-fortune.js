(() => {
  // src/wheel-fortune.js
  var WheelController = class {
    /**
     * @type {HTMLDialogElement}
     */
    dialog;
    /**
     * @type {WheelOfFortune}
     */
    wheel;
    /**
     * @type {HTMLElement}
     */
    closer;
    /**
     * @type {any}
     */
    wheelStoppedListener;
    // get open() { return this.dialog.open }
    constructor() {
      this.wheelStoppedListener = this.onWheelStopped.bind(this);
      this.reload();
    }
    /**
     * @param {boolean} keepOpen
     */
    reload(keepOpen) {
      this.dialog = document.querySelector("#wheel-dialog");
      this.wheel = this.dialog.querySelector("#wheel");
      this.closer = this.dialog.querySelector(".wheel-dialog__closer");
      this.setup();
      if (keepOpen) this.dialog.showModal();
    }
    setup() {
      this.wheel.removeEventListener("wheel-stopped", this.wheelStoppedListener);
      this.wheel.addEventListener("wheel-stopped", this.wheelStoppedListener);
      this.closer.addEventListener("click", () => this.dialog.close());
    }
    async onWheelStopped(e) {
      const party = this.dialog?.querySelector(".wheel-dialog__party");
      if (party) party.style.display = "block";
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      this.dialog?.close();
      const discount = e.detail;
      this.applyDiscount(discount);
    }
    applyDiscount(discount) {
      if (!_rsi.cart) return false;
      if (typeof _RSI_COD_FORM_DOWNSELLS === "undefined") return false;
      if (_rsi.dss.offerShown || _rsi.dss.activeDiscount) return false;
      _rsi.dss.currentOffer = _RSI_COD_FORM_DOWNSELLS[0];
      _rsi.dss.activeDiscount = {
        type: _rsi.dss.currentOffer.ds.t,
        value: discount * 100,
        downsellId: _rsi.dss.currentOffer.id
      };
      if (_rsi.dss.currentOffer.disForDisc) {
        _rsi.dss.disOtherDisc = true;
      }
      if (!_rsi.productPage.optionsHandlers.blockBuyClick()) {
        let o2 = function(t) {
          t = t || "update";
          let o3 = !!(window.AwesomeQuantityBreak && document.querySelector("#awesome-quantity-data") || window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS);
          if (t == "update" && !o3) {
            try {
              a = a.replace("&&", "&");
              let s = _rsi.u.queryStringToJSON(a);
              if (!s.quantity) {
                let i = 1;
                document.querySelectorAll('[name="quantity"]').forEach((e) => {
                  if (e.value > i) i = e.value;
                });
                s.quantity = i;
              }
              if (!s.id && s.variant_id) {
                s.id = s.variant_id;
              }
              if (s.id && s.quantity) {
                window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL = [{ id: s.id, quantity: s.quantity }];
                o3 = true;
              } else {
                _rsi.u.sendReport({ msg: "Could not find id or quantity while generating jsonAddData on addToCart popup in product page. addData: " + a });
                t = "add";
              }
            } catch (e) {
              _rsi.u.sendReport({ msg: "Error while generating jsonAddData on addToCart popup in product page. Error: " + e + " addData: " + a }), t = "add";
            }
          }
          if (o3) {
            let e = [];
            if (window.AwesomeQuantityBreak) {
              e = window.AwesomeQuantityBreak.selectedVariants;
            } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS) {
              e = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS;
            } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL) {
              e = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL;
            }
            if (!Array.isArray(e)) {
              if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS) {
                e = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS;
              } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL) {
                e = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL;
              }
            }
            let r = {};
            if (t === "update") {
              r.updates = {};
              e.forEach(function(e2) {
                r.updates[e2.id + ""] = e2.quantity;
              });
            } else {
              r.items = e;
            }
            _rsi.u.ajax(
              "POST",
              _rsi.rootShopifyRoute + "cart/" + t + ".js",
              JSON.stringify(r),
              function(e2) {
                try {
                  if (t === "update") {
                    e2 = JSON.parse(e2);
                    _rsi.form.open(false, false, false, e2);
                    return;
                  }
                } catch (e3) {
                  _rsi.u.sendReport({ msg: "Error while parsing data on update.js on addToCart in product page. Error: " + e3 });
                }
                _rsi.form.open();
              },
              null,
              { "Content-Type": "application/json" },
              true
            );
          }
        };
        var o = o2;
        let a = _rsi.u.serializeForm('form[method="post"][action*="/cart/add"]', '[name="form_type"][value="product"]');
        try {
          if (_rsi.form.deferLoading) {
            _rsi.form.mode = "productCart";
            _rsi.form.open(false, false, false, false, a || "product=true");
            if (_rsi.productPage.oldCart === "empty") {
              _rsi.productPage.oldCart = false;
            }
            return;
          }
        } catch (e) {
          console.log(e);
        }
        _rsi.form.mode = "productCart";
        _rsi.form.open(true);
        _rsi.cartManager.clearCart(
          function() {
            _rsi.u.clearCartCookies();
            o2();
          },
          function() {
            _rsi.u.clearCartCookies();
            o2();
          }
        );
      }
    }
    createObserver() {
      const sectionid = this.dialog.querySelector("#wheel-section-id")?.value ?? "null";
      const section = document.querySelector(`#${sectionid}`);
      if (section) {
        const observer = new IntersectionObserver((entries, observer2) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            this.dialog.showModal();
            observer2.unobserve(entry.target);
          }
        }, { threshold: 1 });
        observer.observe(section);
      }
    }
  };
  var wheel = new WheelController();
  if (Shopify.designMode) {
    document.addEventListener("shopify:section:load", wheel.reload);
  }
  wheel.createObserver();
})();
