$(document).ready(function () {
    let selectedServices = [];
    let currentStep = 1;
    let selectedTime = null;
    let selectedDate = null;

    const teamMembers = [
        { id: 0, name: 'Any Stylist', specialty: 'Fastest available', avatar: 'fas fa-users' },
        { id: 1, name: 'Alex Rivera', avatar: 'fas fa-user' },
        { id: 2, name: 'Sarah Chen', avatar: 'fas fa-user' },
        { id: 3, name: 'Marco Rossi', avatar: 'fas fa-user' }
    ];

    // Helper: Get default team member
    function getDefaultTeamMember() {
        return { id: 0, name: 'Any Stylist' };
    }

    // Helper: Build team member options for dropdown
    function buildTeamOptions(selectedId) {
        return teamMembers.map(member =>
            `<option value="${member.id}" ${member.id === selectedId ? 'selected' : ''}>${member.name}</option>`
        ).join('');
    }

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

        // Get summary of team members for display
        const teamSummary = selectedServices.length > 0
            ? [...new Set(selectedServices.map(s => s.teamMember.name))].join(', ')
            : 'Any Stylist';

        slots.forEach(time => {
            container.append(`
                <div class="time-card" data-time="${time}">
                    <div class="time-icon"><i class="far fa-clock"></i></div>
                    <div class="time-info">
                        <span class="time-label">${time}</span>
                        <span class="time-subtext">Available • ${teamSummary}</span>
                    </div>
                    <div class="time-more-btn"><i class="fas fa-ellipsis-v"></i></div>
                </div>
            `);
        });
    }

    //(Step 2 - now shows all services with their team selections)
    function renderTeamMembers() {
        const container = $('#team-list');
        container.empty();

        if (selectedServices.length === 0) {
            container.append('<p style="color: #888; text-align: center;">Please select services first</p>');
            return;
        }

        selectedServices.forEach((service, index) => {
            container.append(`
                <div class="service-team-selector" data-service-index="${index}">
                    <div class="service-team-header">
                        <span class="service-team-name">${service.name}</span>
                        <span class="service-team-price">₹${service.price}</span>
                    </div>
                    <div class="team-options-container">
                        ${teamMembers.map(member => `
                            <div class="team-card ${service.teamMember.id === member.id ? 'selected' : ''}" 
                                 data-member-id="${member.id}" 
                                 data-member-name="${member.name}"
                                 data-service-index="${index}">
                                <div class="team-avatar"><i class="${member.avatar}"></i></div>
                                <div class="team-info">
                                    <span class="team-name">${member.name}</span>
                                    ${member.specialty ? `<span class="team-specialty">${member.specialty}</span>` : ''}
                                </div>
                                <div class="team-select-icon"><i class="fas fa-check-circle"></i></div>
                            </div>
                        `).join('')}
                    </div>
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

            selectedServices.push({
                id,
                name,
                price,
                teamMember: getDefaultTeamMember()
            });
        }
        updateSummary();
    });

    // Team member selection in Step 2 
    $(document).on('click', '#team-list .team-card', function () {
        const serviceIndex = $(this).data('service-index');
        const memberId = $(this).data('member-id');
        const memberName = $(this).data('member-name');


        if (selectedServices[serviceIndex]) {
            selectedServices[serviceIndex].teamMember = {
                id: memberId,
                name: memberName
            };
        }


        $(this).closest('.team-options-container').find('.team-card').removeClass('selected');
        $(this).addClass('selected');

        updateSummary();
        renderTimeSlots();
    });

    // Team member change 
    $(document).on('change', '.summary-team-select', function () {
        const serviceId = $(this).data('service-id');
        const memberId = parseInt($(this).val());
        const member = teamMembers.find(m => m.id === memberId);

        const service = selectedServices.find(s => s.id === serviceId);
        if (service && member) {
            service.teamMember = { id: member.id, name: member.name };
        }

        renderTeamMembers();
        renderTimeSlots();
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
                    <div class="summary-service-item">
                        <div class="summary-service-header">
                            <span class="summary-item-name">${service.name}</span>
                            <span class="summary-item-price">₹${service.price}</span>
                        </div>
                        <div class="summary-team-row">
                            <i class="fas fa-user-check"></i>
                            <select class="summary-team-select" data-service-id="${service.id}">
                                ${buildTeamOptions(service.teamMember.id)}
                            </select>
                        </div>
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
        else if (currentStep === 2) {
            $('#main-continue-btn').text('Select Time');
            renderTeamMembers();
        }
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

    // Category Click - Smooth Scroll to Section
    $('.category-item').on('click', function () {
        $('.category-item').removeClass('active');
        $(this).addClass('active');

        const selectedCat = $(this).data('category');
        const targetSection = $(`#section-${selectedCat}`);

        if (targetSection.length) {
            const servicesList = $('#services-list');
            const scrollOffset = targetSection.position().top + servicesList.scrollTop() - 10;

            servicesList.animate({
                scrollTop: scrollOffset
            }, 400, 'swing');
        }
    });


    $('#services-list').on('scroll', function () {
        const scrollPos = $(this).scrollTop();
        const sections = $('.service-section');

        sections.each(function () {
            const sectionTop = $(this).position().top + scrollPos - 50;
            const sectionBottom = sectionTop + $(this).outerHeight();
            const sectionId = $(this).attr('id');
            const category = sectionId.replace('section-', '');

            if (scrollPos >= sectionTop - 100 && scrollPos < sectionBottom - 100) {
                $('.category-item').removeClass('active');
                $(`.category-item[data-category="${category}"]`).addClass('active');
            }
        });
    });
});