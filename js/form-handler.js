/**
 * ONIX Form Handler
 * Handles form validation, submission, and feedback
 */

import { Analytics } from './analytics.js';

// ============ CONFIGURATION ============
const FORM_CONFIG = {
    // ONIX Admin webhook — sends leads directly to your admin panel database
    // Change this to your production admin URL when deployed (e.g., https://admin.onixmrkt.com/api/webhook/lead)
    LEAD_WEBHOOK: '/api/webhook/lead',

    // Formspree endpoint (optional fallback — set your form ID if using Formspree)
    FORMSPREE_ENDPOINT: '',

    // Webhook URL for real-time notifications (optional — Slack/Discord)
    WEBHOOK_URL: '',

    // Success/Error messages
    MESSAGES: {
        success: "Thanks for reaching out! We'll get back to you within 24 hours.",
        error: "Oops! Something went wrong. Please try again or email us directly.",
        validationError: "Please fill in all required fields correctly."
    }
};

// ============ VALIDATION ============
const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    phone: (value) => {
        // Allow various phone formats, minimum 8 digits
        const phoneRegex = /^[\d\s\-+()]{8,}$/;
        return !value || phoneRegex.test(value); // Phone is optional
    },
    name: (value) => {
        return value && value.trim().length >= 2;
    },
    message: (value) => {
        return value && value.trim().length >= 10;
    }
};

function validateField(field) {
    const { name, value, required } = field;
    const isEmpty = !value || !value.trim();

    // Check required
    if (required && isEmpty) {
        return { valid: false, message: 'This field is required' };
    }

    // Skip validation for empty optional fields
    if (isEmpty) {
        return { valid: true };
    }

    // Run specific validator if exists
    if (validators[name] && !validators[name](value)) {
        const messages = {
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number',
            name: 'Name must be at least 2 characters',
            message: 'Message must be at least 10 characters'
        };
        return { valid: false, message: messages[name] || 'Invalid input' };
    }

    return { valid: true };
}

function validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    const errors = [];

    fields.forEach(field => {
        const result = validateField(field);
        const errorEl = field.parentElement.querySelector('.field-error');

        if (!result.valid) {
            isValid = false;
            errors.push({ field: field.name, message: result.message });
            field.classList.add('error');
            if (errorEl) {
                errorEl.textContent = result.message;
                errorEl.style.display = 'block';
            }
        } else {
            field.classList.remove('error');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        }
    });

    return { isValid, errors };
}

// ============ FORM SUBMISSION ============
async function submitForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add metadata
    data._meta = {
        submitted_at: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
    };

    try {
        let response;

        // Primary: submit to ONIX Admin webhook (creates lead in database)
        if (FORM_CONFIG.LEAD_WEBHOOK) {
            response = await fetch(FORM_CONFIG.LEAD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    message: data.message || '',
                    source: 'website',
                    page_url: window.location.href
                })
            });
        }
        // Fallback: submit to Formspree if configured
        else if (FORM_CONFIG.FORMSPREE_ENDPOINT) {
            response = await fetch(FORM_CONFIG.FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
        }

        if (response && response.ok) {
            // Track successful submission
            Analytics.trackFormSubmit(form.id || 'contact-form', {
                form_name: data.name,
                form_email: data.email
            });

            // Send webhook notification if configured
            if (FORM_CONFIG.WEBHOOK_URL) {
                sendWebhookNotification(data);
            }

            return { success: true };
        } else {
            const errorData = response ? await response.json().catch(() => ({})) : {};
            return { success: false, error: errorData };
        }
    } catch (error) {
        console.error('Form submission error:', error);
        return { success: false, error: error.message };
    }
}

// ============ WEBHOOK NOTIFICATION ============
async function sendWebhookNotification(data) {
    if (!FORM_CONFIG.WEBHOOK_URL) return;

    const message = {
        text: `🎯 New Lead from ONIX Website`,
        blocks: [
            {
                type: "header",
                text: { type: "plain_text", text: "🎯 New Contact Form Submission" }
            },
            {
                type: "section",
                fields: [
                    { type: "mrkdwn", text: `*Name:*\n${data.name}` },
                    { type: "mrkdwn", text: `*Email:*\n${data.email}` },
                    { type: "mrkdwn", text: `*Phone:*\n${data.phone || 'Not provided'}` }
                ]
            },
            {
                type: "section",
                text: { type: "mrkdwn", text: `*Message:*\n${data.message}` }
            },
            {
                type: "context",
                elements: [
                    { type: "mrkdwn", text: `Submitted: ${new Date().toLocaleString()}` }
                ]
            }
        ]
    };

    try {
        await fetch(FORM_CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
    } catch (error) {
        console.error('Webhook notification error:', error);
    }
}

// ============ UI FEEDBACK ============
function showFormFeedback(form, type, message) {
    // Remove existing feedback
    const existingFeedback = form.querySelector('.form-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `form-feedback form-feedback-${type}`;
    feedback.innerHTML = `
        <div class="feedback-icon">
            ${type === 'success' ? '✓' : '✕'}
        </div>
        <div class="feedback-message">${message}</div>
    `;

    // Insert at top of form
    form.insertBefore(feedback, form.firstChild);

    // Auto-remove after delay
    if (type === 'success') {
        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 300);
        }, 5000);
    }
}

function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitBtn) return;

    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span class="btn-spinner"></span>
            <span>Sending...</span>
        `;
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.originalText || 'Send Message';
    }
}

// ============ INITIALIZATION ============
function initFormHandler() {
    // Find all forms with data-form-handler attribute or specific IDs
    const forms = document.querySelectorAll('#contact-form, [data-form-handler]');

    forms.forEach(form => {
        // Add error containers to each field
        form.querySelectorAll('.form-group').forEach(group => {
            if (!group.querySelector('.field-error')) {
                const errorEl = document.createElement('span');
                errorEl.className = 'field-error';
                errorEl.style.display = 'none';
                group.appendChild(errorEl);
            }
        });

        // Handle real-time validation
        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => {
                const result = validateField(field);
                const errorEl = field.parentElement.querySelector('.field-error');

                if (!result.valid) {
                    field.classList.add('error');
                    if (errorEl) {
                        errorEl.textContent = result.message;
                        errorEl.style.display = 'block';
                    }
                } else {
                    field.classList.remove('error');
                    if (errorEl) {
                        errorEl.style.display = 'none';
                    }
                }
            });

            // Clear error on input
            field.addEventListener('input', () => {
                field.classList.remove('error');
                const errorEl = field.parentElement.querySelector('.field-error');
                if (errorEl) {
                    errorEl.style.display = 'none';
                }
            });
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate
            const { isValid, errors } = validateForm(form);

            if (!isValid) {
                showFormFeedback(form, 'error', FORM_CONFIG.MESSAGES.validationError);
                // Focus first error field
                const firstError = form.querySelector('.error');
                if (firstError) firstError.focus();
                return;
            }

            // Submit
            setFormLoading(form, true);

            const result = await submitForm(form);

            setFormLoading(form, false);

            if (result.success) {
                showFormFeedback(form, 'success', FORM_CONFIG.MESSAGES.success);
                form.reset();
            } else {
                showFormFeedback(form, 'error', FORM_CONFIG.MESSAGES.error);
            }
        });
    });
}

// Add required CSS for form feedback
function injectFormStyles() {
    if (document.getElementById('form-handler-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'form-handler-styles';
    styles.textContent = `
        .field-error {
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        }

        .form-group input.error,
        .form-group textarea.error {
            border-color: #ef4444 !important;
        }

        .form-feedback {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideIn 0.3s ease;
        }

        .form-feedback-success {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #22c55e;
        }

        .form-feedback-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
        }

        .feedback-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }

        .form-feedback-success .feedback-icon {
            background: rgba(34, 197, 94, 0.2);
        }

        .form-feedback-error .feedback-icon {
            background: rgba(239, 68, 68, 0.2);
        }

        .form-feedback.fade-out {
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }

        .btn-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styles);
}

// Export
export { initFormHandler, FORM_CONFIG };
