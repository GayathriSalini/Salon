$(document).ready(function () {
    let selectedServices = [];
    let selectedTeamMember = { id: 0, name: 'Any Stylist' };
    let currentStep = 1;
    let selectedTime = null;
    let selectedDate = null;

    const teamMembers = [
        { id: 0, name: 'Any Stylist', specialty: 'Fastest available', avatar: 'fas fa-users' },
        { id: 1, name: 'Alex Rivera', specialty: 'Senior Stylist', avatar: 'fas fa-user' },
        { id: 2, name: 'Sarah Chen', specialty: 'Color Expert', avatar: 'fas fa-user' },
        { id: 3, name: 'Marco Rossi', specialty: 'Skin Specialist', avatar: 'fas fa-user' }
    ];

    // Helper: Initialize Date Picker
    function initializeDatePicker() {
        const picker = $('#date-scroll');
        picker.empty();

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            const dayName = days[date.getDay()];
            const dateNum = date.getDate();
            const dateFull = date.toISOString().split('T')[0];

            const activeClass = i === 0 ? 'active' : '';
            if (i === 0) {
                selectedDate = dateFull;
                $('#booking-date').val(dateFull);
            }

            picker.append(`
                <div class="date-item ${activeClass}" data-date="${dateFull}">
                    <span class="date-day">${dayName}</span>
                    <span class="date-number">${dateNum}</span>
                </div>
            `);
        }

        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        $('#current-full-date').text(today.toLocaleDateString('en-US', options));
    }

    // Helper: Render Time Slots
    function renderTimeSlots() {
        const container = $('#time-slots-container');
        container.empty();

        const slots = [
            "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM",
            "04:00 PM", "05:00 PM"
        ];

        slots.forEach(time => {
            container.append(`
                <div class="time-card" data-time="${time}">
                    <div class="time-icon"><i class="far fa-clock"></i></div>
                    <div class="time-info">
                        <span class="time-label">${time}</span>
                        <span class="time-subtext">Available • ${selectedTeamMember.name}</span>
                    </div>
                    <div class="time-more-btn"><i class="fas fa-ellipsis-v"></i></div>
                </div>
            `);
        });
    }

    // Helper: Render Team Members
    function renderTeamMembers() {
        const container = $('#team-list');
        container.empty();

        teamMembers.forEach(member => {
            const isSelected = selectedTeamMember.id === member.id ? 'selected' : '';
            const avatarContent = `<i class="${member.avatar}"></i>`;

            container.append(`
                <div class="team-card ${isSelected}" data-id="${member.id}" data-name="${member.name}">
                    <div class="team-avatar">${avatarContent}</div>
                    <div class="team-info">
                        <span class="team-name">${member.name}</span>
                        
                    </div>
                    <div class="team-select-icon"><i class="fas fa-check-circle"></i></div>
                </div>
            `);
        });
    }

    initializeDatePicker();
    renderTimeSlots();
    renderTeamMembers();

    // Date Picker Navigation
    $('#date-prev').on('click', function () {
        $('#date-scroll').animate({
            scrollLeft: '-=200'
        }, 300);
    });

    $('#date-next').on('click', function () {
        $('#date-scroll').animate({
            scrollLeft: '+=200'
        }, 300);
    });

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

    $(document).on('click', '.team-card', function () {
        $('.team-card').removeClass('selected');
        $(this).addClass('selected');
        selectedTeamMember = {
            id: $(this).data('id'),
            name: $(this).data('name')
        };
        updateSummary();
        renderTimeSlots(); // Update subtext in time slots
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

            // Add Professional if selected
            list.append(`
                <div class="summary-item" style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <span class="summary-item-name"><i class="fas fa-user-check" style="margin-right: 8px;"></i>${selectedTeamMember.name}</span>
                    <span class="summary-item-price" style="font-size: 0.8rem; font-weight: 400; color: #888;">Professional</span>
                </div>
            `);

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
            goToStep(3);
        } else if (currentStep === 3) {
            if (!selectedTime || !$('#booking-date').val()) {
                alert('Please select a date and time');
                return;
            }
            goToStep(4);
        } else if (currentStep === 4) {
            alert('Booking Confirmed! Thank you.');
            window.location.href = 'home.html';
        }
    });

    function goToStep(step) {
        $('.booking-step').removeClass('active');
        $(`#step-${step}`).addClass('active');
        currentStep = step;

        if (currentStep === 1) $('#main-continue-btn').text('Continue');
        else if (currentStep === 2) $('#main-continue-btn').text('Select Time');
        else if (currentStep === 3) $('#main-continue-btn').text('Go to Details');
        else if (currentStep === 4) $('#main-continue-btn').text('Confirm Booking');

        window.scrollTo(0, 0);
    }

    $('.back-btn').on('click', function () {
        goToStep(currentStep - 1);
    });

    // Date Selection
    $(document).on('click', '.date-item', function () {
        $('.date-item').removeClass('active');
        $(this).addClass('active');
        selectedDate = $(this).data('date');
        $('#booking-date').val(selectedDate);
    });

    // Time Selection
    $(document).on('click', '.time-card', function () {
        $('.time-card').removeClass('selected');
        $(this).addClass('selected');
        selectedTime = $(this).data('time');
    });

    // Category Switching
    $('.category-item').on('click', function () {
        $('.category-item').removeClass('active');
        $(this).addClass('active');

        const selectedCat = $(this).data('category');
        $('.category-heading').text($(this).text());

        $('.service-card').hide();
        $(`.service-card[data-category="${selectedCat}"]`).fadeIn();
    });
});