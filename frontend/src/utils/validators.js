const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkEmail(email) {
    if (!email.trim()) return "Email is required.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
    return "";
}

export function validateLogin({ email, password }) {
    const errors = {};
    const emailError = checkEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = "Password is required.";
    return errors;
}

export function validateSignup({ name, email, password }) {
    const errors = {};
    if (name.trim().length < 2) errors.name = "Enter your full name.";
    const emailError = checkEmail(email);
    if (emailError) errors.email = emailError;
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = "Include at least one letter and one number.";
    return errors;
}