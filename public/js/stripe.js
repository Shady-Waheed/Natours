// DOM Element
const bookBtn = document.getElementById('book-tour');

//

const stripe = Stripe(
  'pk_test_51Q56sZDzRBWfu8GM5h2f5QbVH6ze3iMP9MHERLwD36osfNbHQCrLntEVxlCRrDrbMHbRLShbDo4B5iSQ9Jaycigc003R5lmmAL',
);

const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/booking/checkout-session/${tourId}`,
    );
    // console.log(session)

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
