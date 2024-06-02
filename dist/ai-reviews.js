//- Static Code
const defaultReviews = [
  {author: "María González",     text: "Desde que compré este producto, he ahorrado tanto tiempo como dinero. La entrega llegó rapidísimo y en perfectas condiciones. Es increíble cómo facilita mi día a día. ¡Definitivamente vale la pena probarlo, no me arrepiento de la compra!"},
  {author: "Carlos Ramírez",     text: "Llevaba meses buscando algo así y finalmente lo encontré aquí. La atención al cliente fue muy buena, despejaron todas mis dudas con rapidez y profesionalismo. Muy satisfecho con la compra, es justo lo que necesitaba para resolver mi problema"},
  {author: "Laura Fernández",    text: "No esperaba que este producto fuera de tanta calidad, pero ahora estoy muy satisfecha. La entrega fue rápida y sin complicaciones, lo que me dio mucha tranquilidad. Recomiendo este producto sin dudarlo, realmente superó mis expectativas iniciales."},
  {author: "Juan Martínez",      text: "Nunca me fiaba de comprar en estas páginas, pero este producto me hizo cambiar de opinión. El servicio al cliente fue muy amable y eficiente. Estoy muy contento con la compra y siento que puedo confiar en este sitio para futuras compras."},
  {author: "Ana López",          text: "Pensé que sería una estafa, pero el producto llegó en muy poco tiempo y fue tal como lo describen. Funcionó perfectamente desde el primer día. Honestamente, estoy muy impresionado y definitivamente lo recomendaría a cualquiera."},
  {author: "Luis Pérez",         text: "Este producto ha solucionado un problema que tenía desde hace tiempo. La entrega fue increíblemente rápida y eficiente. Realmente cambió mi rutina diaria para mejor. Muy satisfecho con la compra y siempre lo recomiendo a amigos y conocidos."},
  {author: "Marta Sánchez",      text: "Estaba buscando una solución a mi problema y este producto fue perfecto. El servicio al cliente fue muy servicial y atento, me ayudaron en todo momento. Lo recomiendo sin dudar, es una inversión que realmente vale la pena."},
  {author: "Diego Rivera",       text: "El precio me pareció muy razonable para la calidad que ofrece. Realmente ha sido una muy buena inversión. He notado mejoras significativas en mi rutina diaria desde que lo uso. Es definitivamente algo que recomendaría a quien busque calidad a buen precio."},
  {author: "Patricia Gómez",     text: "Es justo lo que necesitaba. La atención al cliente fue excelente y siempre estuvieron dispuestos a ayudar con mis dudas. Estoy muy satisfecho con mi compra y no dudaré en recomendar este producto a mis amigos y familiares."},
  {author: "Javier Torres",      text: "Tenía mis dudas pero este producto cumplió con todas mis expectativas. La entrega fue muy rápida, llegó antes de lo que esperaba y sin ningún inconveniente. Estoy muy contento con la compra y lo recomendaría sin dudar."},
  {author: "Claudia Hernández",  text: "Este producto ha sido de gran ayuda para mi día a día. La atención al cliente es fenomenal y resolvieron todas mis dudas inmediatamente. Lo recomiendo a quienes busquen una buena solución para facilitar su rutina diaria."},
  {author: "Alberto Ruiz",       text: "No era fácil encontrar algo así, pero aquí lo tienen. La entrega fue sorprendentemente rápida y eficiente, lo cual agradezco mucho. Muy feliz con mi compra, el producto funciona perfectamente y cumple con todas mis expectativas."},
  {author: "Daniela Castillo",   text: "La durabilidad de este producto es impresionante. Lo uso todos los días y sigue como nuevo. Realmente lo recomendaría a cualquiera que busque un producto fiable y duradero. Estoy extremadamente satisfecho con mi compra."},
  {author: "Pablo Vargas",       text: "Me sorprendió lo rápido que llegó el paquete y la calidad del producto. El envío fue tan rápido que no tuve que esperar nada. Estoy muy satisfecho con la compra y el producto cumple todas mis expectativas."},
  {author: "Sofía Morales",      text: "Este producto ha sido clave para mejorar mi rutina diaria. Me ahorra mucho tiempo y esfuerzo, y la verdad es que fue una inversión excelente. Sin duda, fue una buena compra que volvería a hacer sin pensarlo dos veces."},
  {author: "Fernando Gutiérrez", text: "La rapidez en la entrega me sorprendió gratamente. El producto es de buena calidad y cumple su función perfectamente, justo lo que necesitaba. Definitivamente lo recomendaría a quienes buscan eficiencia y calidad en un mismo producto."},
  {author: "Carolina Castro",    text: "El producto es justo lo que necesitaba y la atención al cliente fue estupenda. Me ayudaron con todas mis dudas de forma rápida y efectiva. Lo recomendaré a mis amigos, estoy completamente satisfecho con mi experiencia de compra."},
  {author: "Ricardo Díaz",       text: "Había probado otros y ninguno como este. La calidad del producto es excelente y cumplió con todas mis expectativas. La entrega fue muy rápida y sin problemas. ¡Lo recomiendo a cualquiera que busque calidad y eficiencia en un solo producto!"},
  {author: "Elena Vargas",       text: "Desde que lo tengo, he notado una mejora significativa en mis actividades diarias. La atención al cliente fue muy cordial y siempre estuvieron disponibles para ayudarme. Definitivamente lo recomendaré, realmente ha marcado una diferencia en mi rutina."},
  {author: "Andrés Mendoza",     text: "Este producto me ha facilitado mucho la vida. Llegó antes de lo previsto y en perfectas condiciones. Estoy muy satisfecho con la compra y lo recomendaré sin dudas a quienes buscan soluciones prácticas y de calidad."},
];

const reviewsMediaRaw = document.querySelector("#reviews-media").textContent;
const reviewsMedia = JSON.parse(reviewsMediaRaw);

for(let i=0; i<reviewsMedia.length;i++){
  delete reviewsMedia[i].preview_image;
}

const [mainSelector, secondarySelector] = document.querySelectorAll("variant-selects");

const mainInputs = mainSelector.querySelectorAll("input");
const secondaryInputs = secondarySelector.querySelectorAll("input");

mainSelector.addEventListener("change", (e) => {
  const index = [...mainInputs].indexOf(e.target);
  secondaryInputs[index].checked = true;
});

secondarySelector.addEventListener("change", (e) => {
  e.stopImmediatePropagation();
  const index = [...secondaryInputs].indexOf(e.target);
  mainInputs[index].click();
});

const Storage = {
  get(key) { return this[key]; },
  set(key, value) { this[key] = value; }
};

const storage = Object.create(Storage);

function maxSlide() {
  const columns = getComputedStyle(reviewsScroll).getPropertyValue('--review-columns');
  return rawReviews.length - columns + 2;
}

function scrollToSlide(slideIndex) {
  console.log('move to: '+ slideIndex);
  const currentSlide = document.querySelector(`.review-slide:nth-child(${slideIndex})`);
  currentSlide.scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start'});
}

//- Dynamic Code
let rawReviews = [];
let reviewsScroll = null;
let currentSlide = interval = collapsible = dialog = null;

function init() {
  console.log('Javascript :: Init');

  currentSlide = 2;

  interval = null;

  collapsible = document.querySelector("#reviews-collapsible");

  const controlButtons = document.querySelectorAll(".reviews-paginator>button");
  
  controlButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = parseInt(button.dataset.direction);
      
      const rows = getComputedStyle(reviewsScroll).getPropertyValue('--review-rows');
      
      const newSlide = currentSlide + (direction * (parseInt(rows) + 1));

      if(newSlide < 2 || newSlide > maxSlide()) return;
      
      currentSlide = newSlide;
      
      scrollToSlide(currentSlide);
    });
  });

  dialog = document.querySelector("#reviews-dialog");

  dialog.addEventListener('click', (e) => {
    if(e.target === dialog) dialog.close();
  });
}

function dispose() {
  console.log('Javascript :: Dispose');
  clearInterval(interval);
}

init();

if(Shopify.designMode) {
  document.addEventListener("shopify:section:load", init);
  document.addEventListener("shopify:section:unload", dispose);
}

function autoScroll() {
  interval = setInterval(() => {
    const rows = getComputedStyle(reviewsScroll).getPropertyValue('--review-rows');

    currentSlide = currentSlide + 1 + parseInt(rows);
      
    if(currentSlide > maxSlide() - 1) {
      currentSlide = 2;
    }

    scrollToSlide(currentSlide);
  }, 3000);
}

async function fetchReviews(shopId, productId) {
  const storeCache = storage.get(shopId);

  let store = null;

  if(!storeCache) {
    store = await getStoreInfo(shopId);
    storage.set(shopId, store);
  } else {
    store = storeCache;
  }

  if(!store.active) {
    throw new Error('No se ha registrado el pago, por favor, cancele para continuar usando el programa.');
  }

  const productCache = storage.get(productId);

  let product = null;

  if(!productCache) {
    console.log('Cargando reviews');
    product = await getProductInfo(shopId, productId);
    storage.set(productId, product);
  } else{
    product = productCache;
  }

  let reviews = null;

  if(product?.exists) {
    reviews = product.reviews;
  } else {
    reviews = defaultReviews;
  }

  return reviews;
}

function formatReviews(unformattedReviews) {
  const reviews = structuredClone(unformattedReviews);

  const now = new Date();

  let today = now.getDate();
  let month = now.getMonth();
  const year = now.getFullYear();

  if(today < 5) {
    today = new Date(year, month, 0).getDate();
  } else {
    today--;
    month++;
  }

  const options = { year: "numeric", month: "long", day: "numeric" };

  for(let i = 0; i < reviews.length; i++) {
    const day = Math.floor(Math.random() * today) + 1;
    const date = new Date(`${year}/${month}/${day}`);
    const stars = Math.round(Math.random() * 1 + 4);
    reviews[i].date = new Intl.DateTimeFormat("es", options).format(date);
    reviews[i].stars = stars;
  }

  return reviews;
}

document.addEventListener('alpine:init', () => {
  Alpine.data('reviewsData', () => ({
    async init() {
      console.log('Alpine :: Init');

      this.$watch('reviews', () => {
        if(!this.reviews.length) return;

        reviewsScroll = document.querySelector(".reviews");

        const autoplay = document.querySelector("#scroll-type").value === "auto";

        if(autoplay) {
          autoScroll();
        }
      });

      this.$watch('success', (value) => {
        if(value) collapsible.dataset.open = "true";
      });

      this.$watch('error', (value) => {
        if(value) collapsible.dataset.open = "true";
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
      if(selected) {
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
      if(this.loading) return;

      this.reset();

      const form = Object.fromEntries(new FormData(this.$el));

      if(!form.prompt) return;

      try {
        const response = await fetch(
          `https://us-central1-shopify-reviews-422715.cloudfunctions.net/generateReviews${this.country}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          }
        );

        const json = await response.json();

        if(!json.ok) {
          throw new Error(json.error);
        }

        rawReviews = json.reviews;

        storage.set(form.productId, {exists: true, reviews: rawReviews});

        this.reviews = formatReviews(rawReviews);

        this.success = {message: "Reseñas generadas exitosamente."};
      } catch(error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async saveReviews() {
      if(this.loading) return;

      this.reset();

      const form = Object.fromEntries(new FormData(this.$el));

      const body = {
        shopId: form.shopId,
        product: {
          id: form.productId,
          name: form.productName,
          reviews: rawReviews
        },
      };

      try {
        const response = await fetch(
          'https://us-central1-shopify-reviews-422715.cloudfunctions.net/saveReviews',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }
        );

        const json = await response.json();

        if(!json.ok) {
          throw new Error(json.error);
        }

        this.success = {message: "Reseñas guardadas exitosamente."};
      } catch(error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  }));
});