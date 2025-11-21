// ===================================
// MOBILE MENU TOGGLE
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMobile = document.querySelector('.nav-mobile');

  if (mobileMenuBtn && navMobile) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';

      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenuBtn.classList.toggle('active');
      navMobile.classList.toggle('open');
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = navMobile.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.classList.remove('active');
        navMobile.classList.remove('open');
      });
    });
  }
});

// ===================================
// PROJECT FILTERING
// ===================================
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.projects-grid .card');

if (filterButtons.length > 0) {
  // Show all projects initially
  projectCards.forEach((card) => card.classList.add('visible'));

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter projects
      projectCards.forEach((card) => {
        if (filter === 'all') {
          card.classList.add('visible');
        } else {
          const tags = card.getAttribute('data-tags') || '';
          if (tags.includes(filter)) {
            card.classList.add('visible');
          } else {
            card.classList.remove('visible');
          }
        }
      });
    });
  });
}

// ===================================
// CONTACT FORM VALIDATION & SUBMISSION
// ===================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-group').forEach((group) => {
      group.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach((error) => {
      error.textContent = '';
    });

    // Validate form
    let isValid = true;

    const name = document.getElementById('name');
    if (!name.value.trim()) {
      showError('name', 'Please enter your name');
      isValid = false;
    }

    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError('email', 'Please enter your email');
      isValid = false;
    } else if (!emailPattern.test(email.value)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }

    const message = document.getElementById('message');
    if (!message.value.trim()) {
      showError('message', 'Please enter a message');
      isValid = false;
    } else if (message.value.trim().length < 10) {
      showError('message', 'Message must be at least 10 characters');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Get form data
    const formData = {
      name: name.value.trim(),
      email: email.value.trim(),
      company: document.getElementById('company').value.trim(),
      service: document.getElementById('service').value,
      message: message.value.trim(),
    };

    // Disable submit button
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // TODO: Replace with your actual form submission endpoint
      // Example: Formspree, EmailJS, or your own API

      // Simulate API call (remove this in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just log to console
      console.log('Form submission:', formData);

      // Show success message
      const successMessage = document.getElementById('formSuccess');
      successMessage.classList.add('show');

      // Reset form
      contactForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      alert(
        'Sorry, there was an error sending your message. Please try again or email us directly.'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function showError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const formGroup = field.closest('.form-group');
  const errorElement = document.getElementById(fieldId + 'Error');

  formGroup.classList.add('error');
  errorElement.textContent = errorMessage;
}

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});
