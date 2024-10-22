const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../modules/tourModel');
const User = require('../modules/userModel');
const Booking = require('../modules/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// دالة لإنشاء جلسة Checkout
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) احصل على الجولة المحجوزة حاليًا
    const tour = await Tour.findById(req.params.tourId);

    // 2) إنشاء جلسة Checkout
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100, // تحويل السعر إلى السنتات
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: `${tour.summary}`,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
                        ],
                    },
                },
                quantity: 1,
            },
        ],
    });

    // 3) إنشاء الجلسة كاستجابة
    res.status(200).json({
        status: 'success',
        session,
    });
});

// دالة لإنشاء حجز بعد عملية الدفع الناجحة
const createBookingCheckout = async (session) => {
    try {
        const tour = session.client_reference_id;
        const user = (await User.findOne({ email: session.customer_email })).id;
        const price = session.line_items[0].unit_amount / 100;
        await Booking.create({ tour, user, price });
    } catch (error) {
        console.error(`Error creating booking: ${error.message}`);
        // يمكنك إضافة تعليمات لتسجيل الخطأ هنا
    }
};

// دالة معالجة الويب هوك
exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        await createBookingCheckout(event.data.object); // انتظر تنفيذ الدالة
    } else {
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
};

// دوال CRUD للحجوزات
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
