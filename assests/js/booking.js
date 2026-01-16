$(document).ready(function () {
    let selectedServices = [];
    let currentStep = 1;
    let selectedTime = null;


    $(document).on('click', '.service-card', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const price = parseInt($(this).data('price'));

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selectedServices = selectedServices.filter(s => s.id !== id);
        } else {
            $(this).addClass('selected');
            selectedServices.push({ id, name, price });
        }
        updateSummary();
    });

    function updateSummary() {
        const list = $('#selected-items-list');
        const emptyMsg = $('#empty-summary-msg');
        const totalEl = $('.total-amount');
        const continueBtn = $('#main-continue-btn');

        list.empty();
        let total = 0;

        if (selectedServices.length === 0) {
            emptyMsg.show();
            continueBtn.prop('disabled', true);
        } else {
            emptyMsg.hide();
            continueBtn.prop('disabled', false);
            selectedServices.forEach(service => {
                list.append(`
                            <div class="summary-item">
                                <span class="summary-item-name">${service.name}</span>
                                <span class="summary-item-price">₹${service.price}</span>
                            </div>
                        `);
                total += service.price;
            });
        }

        totalEl.text('₹' + total);
    }

    // Continue Button Logic
    $('#main-continue-btn').on('click', function () {
        if (currentStep === 1) {
            goToStep(2);
        } else if (currentStep === 2) {
            if (!selectedTime || !$('#booking-date').val()) {
                alert('Please select a date and time');
                return;
            }
            goToStep(3);
        } else if (currentStep === 3) {
            alert('Booking Confirmed! Thank you.');
            window.location.href = 'home.html';
        }
    });

    function goToStep(step) {
        $('.booking-step').removeClass('active');
        $(`#step-${step}`).addClass('active');
        currentStep = step;


        if (currentStep === 1) $('#main-continue-btn').text('Continue');
        else if (currentStep === 2) $('#main-continue-btn').text('Go to Details');
        else if (currentStep === 3) $('#main-continue-btn').text('Confirm Booking');

        window.scrollTo(0, 0);
    }

    $('.back-btn').on('click', function () {
        goToStep(currentStep - 1);
    });


    $(document).on('click', '.time-slot', function () {
        $('.time-slot').removeClass('selected');
        $(this).addClass('selected');
        selectedTime = $(this).data('time');
    });


    // Category Switching
    $('.category-item').on('click', function () {
        $('.category-item').removeClass('active');
        $(this).addClass('active');

        const selectedCat = $(this).data('category');
        $('.category-heading').text($(this).text());

        // Filter services
        $('.service-card').hide();
        $(`.service-card[data-category="${selectedCat}"]`).fadeIn();
    });
});