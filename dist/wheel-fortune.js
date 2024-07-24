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
      try {
        let e = null;
        e?.preventDefault();
        if (typeof _COD_FORM_ON_PRODUCT_PAGE_BUY_NOW_CLICK === "function") {
          _COD_FORM_ON_PRODUCT_PAGE_BUY_NOW_CLICK();
        }
        if (!_rsi.productPage.optionsHandlers.blockBuyClick()) {
          let o2 = function(t2) {
            t2 = t2 || "update";
            if (typeof _COD_FORM_PRODUCT_PAGE_ADD_MODE_OVERWRITE === "string") {
              t2 = _COD_FORM_PRODUCT_PAGE_ADD_MODE_OVERWRITE;
            }
            var e2, r2;
            var o3 = !!(window.AwesomeQuantityBreak && document.querySelector("#awesome-quantity-data") || window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS);
            if (t2 === "update" && !o3) {
              try {
                a = a.replace("&&", "&");
                var s = _rsi.u.queryStringToJSON(a);
                if (!s.quantity) {
                  var i = 1;
                  document.querySelectorAll('[name="quantity"]').forEach((e3) => {
                    if (e3.value > i) {
                      i = e3.value;
                    }
                  });
                  s.quantity = i;
                }
                if (!s.id && s.variant_id) {
                  s.id = s.variant_id;
                }
                if (s.id && s.quantity) {
                  window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL = [{
                    id: s.id,
                    quantity: s.quantity
                  }];
                  o3 = true;
                } else {
                  _rsi.u.sendReport({
                    msg: "Could not find id or quantity while generating jsonAddData on addToCart popup in product page. addData: " + a
                  });
                  t2 = "add";
                }
              } catch (e3) {
                _rsi.u.sendReport({
                  msg: "Error while generating jsonAddData on addToCart popup in product page. Error: " + e3 + " addData: " + a
                });
                t2 = "add";
              }
            }
            if (o3) {
              e2 = [];
              if (window.AwesomeQuantityBreak) {
                e2 = window.AwesomeQuantityBreak.selectedVariants;
              } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS) {
                e2 = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS;
              } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL) {
                e2 = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL;
              }
              if (!Array.isArray(e2)) {
                if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS) {
                  e2 = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS;
                } else if (window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL) {
                  e2 = window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS_INTERNAL;
                }
              }
              r2 = {};
              if (t2 === "update") {
                r2.updates = {};
                e2.forEach(function(e3) {
                  r2.updates[e3.id + ""] = e3.quantity;
                });
              } else {
                r2.items = e2;
              }
              _rsi.u.ajax("POST", _rsi.rootShopifyRoute + "cart/" + t2 + ".js", JSON.stringify(r2), function(e3) {
                try {
                  if (t2 === "update") {
                    e3 = JSON.parse(e3);
                    return _rsi.form.open(false, false, false, e3);
                  }
                } catch (e4) {
                  _rsi.u.sendReport({
                    msg: "Error while parsing data on update.js on addToCart in product page. Error: " + e4
                  });
                }
                _rsi.form.open();
              }, null, {
                "Content-Type": "application/json"
              }, true);
            } else {
              _rsi.u.ajax("POST", _rsi.rootShopifyRoute + "cart/" + t2 + ".js", a, function(e3) {
                setTimeout(function() {
                  _rsi.form.open();
                }, 500);
              }, null, {
                "Content-Type": "multipart/form-data"
              }, true);
            }
          };
          var o = o2;
          _rsi.calculateAppBlockProduct(e.target);
          var a;
          var t = e?.target;
          var r = true;
          if (typeof e?.target.className !== "string" || e.target.className.indexOf("_rsi-buy-now-button") === -1) {
            r = false;
          }
          if (!r) {
            e = e?.target.closest("._rsi-buy-now-button");
            if (e) {
              t = e;
            }
          }
          if (t.className.indexOf("-floating") > -1 || t.className.indexOf("_rsi-buy-now-button-product-in-description") > -1) {
            if (document.querySelector("._rsi-buy-now-button._rsi-buy-now-button-product:not(._rsi-buy-now-button-product-in-description)")) {
              t = document.querySelector("._rsi-buy-now-button._rsi-buy-now-button-product:not(._rsi-buy-now-button-product-in-description)");
            }
          }
          a = t.closest('form[method="post"][action*="/cart/add"]') ? _rsi.u.serializeForm(false, false, t.closest('form[method="post"][action*="/cart/add"]')) : _rsi.u.serializeForm('form[method="post"][action*="/cart/add"]', '[name="form_type"][value="product"]');
          try {
            if (_rsi.appBlockCurrentProduct) {
              a = a.replace("&&", "&");
              let r2 = _rsi.u.queryStringToJSON(a);
              if (!r2.quantity) {
                let t3 = 1;
                document.querySelectorAll('[name="quantity"]').forEach((e2) => {
                  if (e2.value > t3) {
                    t3 = e2.value;
                  }
                });
                r2.quantity = t3;
              }
              if (!r2.id && r2.variant_id) {
                r2.id = r2.variant_id;
              }
              let t2 = false;
              _rsi.appBlockCurrentProduct.variants.forEach((e2) => {
                if (e2.id == r2.id) {
                  t2 = true;
                }
              });
              if (!t2) {
                r2.id = _rsi.appBlockCurrentProduct.variants[0].id + "";
              }
              a = "";
              Object.keys(r2).forEach((e2, t3) => {
                if (t3 > 0) {
                  a += "&";
                }
                a += encodeURI(e2) + "=" + encodeURI(r2[e2]);
              });
            }
          } catch (e2) {
            console.log(e2);
          }
          if (!(a.indexOf("id") > -1 || window.AwesomeQuantityBreak && document.querySelector("#awesome-quantity-data") || window._RSI_COD_FORM_OVERWRITE_ATC_ITEMS)) {
            if (a.indexOf("id") === -1 && _rsi.productPage.productJson) {
              a += "&id=" + _rsi.productPage.productJson.variants[0].id;
            } else {
              return;
            }
          }
          try {
            if (_rsi.form.deferLoading) {
              _rsi.form.mode = "productCart";
              _rsi.form.open(false, false, false, false, a || "product=true");
              if (_rsi.productPage.oldCart === "empty") {
                _rsi.productPage.oldCart = false;
              }
              return;
            }
          } catch (e2) {
            console.log(e2);
          }
          _rsi.form.mode = "productCart";
          _rsi.form.open(true);
          if (_rsi.productPage.optionsHandlers.isActive && a.indexOf("properties") > -1) {
            window._COD_FORM_PRODUCT_PAGE_ADD_MODE_OVERWRITE = "add";
          }
          _rsi.form.mode = "productCart";
          _rsi.form.open(true);
          if (_rsi.productPage.optionsHandlers.isActive && a.indexOf("properties") > -1) {
            window._COD_FORM_PRODUCT_PAGE_ADD_MODE_OVERWRITE = "add";
          }
          t = "product-only";
          if (_rsi.s.productPage.addMode) {
            t = _rsi.s.productPage.addMode;
          }
          if (t === "product-plus-cart") {
            o2("update");
          } else if (_rsi.productPage.oldCart && _rsi.productPage.oldCart === "empty") {
            o2();
          } else {
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
          if (_rsi.productPage.oldCart === "empty") {
            _rsi.productPage.oldCart = false;
          }
        }
      } catch (error) {
        console.error(error);
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
