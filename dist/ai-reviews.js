(() => {
  document.addEventListener("alpine:init", () => {
    Alpine.data("aiReviews", () => ({
      async init() {
        console.log("Alpine :: Init");
      },
      reviews: [],
      credits: 0,
      rating: {},
      expandedReview: null,
      country: Shopify.country,
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
          doom.showModal();
        } else {
          doom.closeModal();
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
      async generateReviews() {
        if (this.loading) return;
        this.reset();
        const form2 = Object.fromEntries(new FormData(this.$el));
        if (!form2.prompt) return;
        console.log(form2);
        try {
          const response = await fetch(
            `https://velkamhell-aireviews.com/api/reviews/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form2)
            }
          );
          const json = await response.json();
          if (!json.ok) {
            const error = json.error;
            throw new Error(error?.message ?? error);
          }
          state.reviews = json.reviews;
          state.credits = json.credits;
          this.reviews = state.copy;
          this.credits = this.credits - 1;
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
            `https://velkamhell-aireviews.com/api/utils/names`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form2)
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
      async saveReviews() {
        if (this.loading) return;
        this.reset();
        const form2 = Object.fromEntries(new FormData(this.$el));
        const body = {
          shopId: form2.shopId,
          product: {
            id: form2.productId,
            name: form2.productName,
            reviews: state.raw
          }
        };
        try {
          const response = await fetch(
            "https://velkamhell-aireviews.com/api/reviews",
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
