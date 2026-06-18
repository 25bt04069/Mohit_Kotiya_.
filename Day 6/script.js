/**
 * script.js — Credit Card Payment Form Logic
 * ============================================================
 * Responsibilities:
 *  1. Format card number (spaces every 4 digits) in real time
 *  2. Auto-format expiry date (MM / YY) in real time
 *  3. Restrict card number & CVV fields to numeric input only
 *  4. Detect card network (Visa / Mastercard) and highlight badge
 *  5. Per-field inline validation on blur
 *  6. Full form validation on submit — strip spaces, check 16 digits
 *  7. Show success or error status message
 * ============================================================
 */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     DOM REFERENCES
  ---------------------------------------------------------- */
  const form            = document.getElementById("paymentForm");
  const nameInput       = document.getElementById("cardholderName");
  const cardInput       = document.getElementById("cardNumber");
  const expiryInput     = document.getElementById("expiryDate");
  const cvvInput        = document.getElementById("cvv");
  const statusMessage   = document.getElementById("statusMessage");

  // Inline hint elements
  const nameHint   = document.getElementById("nameHint");
  const cardHint   = document.getElementById("cardHint");
  const expiryHint = document.getElementById("expiryHint");
  const cvvHint    = document.getElementById("cvvHint");

  // Card network badge icons
  const visaIcon = document.getElementById("visaIcon");
  const mcIcon   = document.getElementById("mcIcon");

  /* ----------------------------------------------------------
     UTILITIES
  ---------------------------------------------------------- */

  /**
   * Show an inline hint beneath a field.
   * @param {HTMLElement} hintEl   - The <span> hint element
   * @param {HTMLElement} inputEl  - The associated <input>
   * @param {string}      message  - Text to display (empty = clear)
   * @param {'error'|'success'|''} type
   */
  function setHint(hintEl, inputEl, message, type) {
    hintEl.textContent = message;
    hintEl.className   = "field-hint" + (type ? " " + type : "");

    // Add/remove visual state classes on the input
    inputEl.classList.remove("invalid", "valid");
    if (type === "error")   inputEl.classList.add("invalid");
    if (type === "success") inputEl.classList.add("valid");
  }

  /**
   * Clear hint and input state.
   */
  function clearHint(hintEl, inputEl) {
    setHint(hintEl, inputEl, "", "");
  }

  /**
   * Strip all non-digit characters from a string.
   * @param {string} value
   * @returns {string}
   */
  function digitsOnly(value) {
    return value.replace(/\D/g, "");
  }

  /**
   * Show the global status message banner.
   * @param {string}             message
   * @param {'error'|'success'}  type
   */
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className   = type;           // applies .error or .success CSS
    statusMessage.style.display = "block";

    // Scroll into view so mobile users can see it
    statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /** Hide the global status banner. */
  function hideStatus() {
    statusMessage.style.display = "none";
    statusMessage.textContent   = "";
    statusMessage.className     = "";
  }

  /* ----------------------------------------------------------
     CARD NUMBER — FORMAT & NETWORK DETECTION
  ---------------------------------------------------------- */

  /**
   * Format raw digits into groups of 4 separated by spaces.
   * Maximum 16 digits → "XXXX XXXX XXXX XXXX"
   * @param {string} digits - Digit-only string (max 16 chars)
   * @returns {string}
   */
  function formatCardNumber(digits) {
    // Split into chunks of 4, then join with spaces
    return digits.match(/.{1,4}/g)?.join(" ") ?? "";
  }

  /**
   * Determine the card network from the first digits.
   * @param {string} digits - Raw digit string
   * @returns {'visa'|'mastercard'|null}
   */
  function detectNetwork(digits) {
    if (/^4/.test(digits))               return "visa";       // Visa: starts with 4
    if (/^5[1-5]/.test(digits))         return "mastercard"; // MC: 51–55
    if (/^2[2-7]/.test(digits))         return "mastercard"; // MC: 2221–2720
    return null;
  }

  /**
   * Highlight the matching network badge icon.
   * @param {'visa'|'mastercard'|null} network
   */
  function updateNetworkBadge(network) {
    visaIcon.classList.toggle("active", network === "visa");
    mcIcon.classList.toggle("active",   network === "mastercard");
  }

  /* ----------------------------------------------------------
     EXPIRY DATE — FORMAT
  ---------------------------------------------------------- */

  /**
   * Format expiry input into "MM / YY".
   * Handles backspace gracefully by tracking previous value length.
   * @param {string} raw  - Current input value (may include '/')
   * @param {string} prev - Value before the last keystroke
   * @returns {string}
   */
  function formatExpiry(raw, prev) {
    const digits = digitsOnly(raw);

    // If user is deleting, don't re-add the slash
    if (prev && raw.length < prev.length) {
      return digits.length <= 2 ? digits : digits.slice(0, 2) + " / " + digits.slice(2, 4);
    }

    if (digits.length === 0) return "";
    if (digits.length <= 2)  return digits;
    return digits.slice(0, 2) + " / " + digits.slice(2, 4);
  }

  /* ----------------------------------------------------------
     EVENT LISTENERS
  ---------------------------------------------------------- */

  // ---- Card Number: real-time formatting ----
  cardInput.addEventListener("input", function () {
    // 1. Strip everything non-digit
    const digits = digitsOnly(this.value).slice(0, 16); // cap at 16 raw digits

    // 2. Re-format and write back (cursor will jump to end — acceptable for card UX)
    this.value = formatCardNumber(digits);

    // 3. Detect network and update badge
    updateNetworkBadge(detectNetwork(digits));

    // 4. Clear any previous error while typing
    if (this.classList.contains("invalid")) {
      clearHint(cardHint, this);
    }

    // 5. Hide global status on edit
    hideStatus();
  });

  // ---- Card Number: prevent non-numeric key presses ----
  cardInput.addEventListener("keypress", function (e) {
    // Allow: backspace, delete, tab, escape, enter, arrow keys (handled by browser)
    if (e.key && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  });

  // ---- Expiry: real-time formatting ----
  let prevExpiry = ""; // track previous value for backspace detection

  expiryInput.addEventListener("input", function () {
    const formatted = formatExpiry(this.value, prevExpiry);
    this.value = formatted;
    prevExpiry = formatted;

    if (this.classList.contains("invalid")) {
      clearHint(expiryHint, this);
    }
    hideStatus();
  });

  // ---- CVV: numeric-only ----
  cvvInput.addEventListener("keypress", function (e) {
    if (e.key && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  });

  cvvInput.addEventListener("input", function () {
    // Strip any non-digit that slipped through (e.g. paste)
    this.value = digitsOnly(this.value).slice(0, 4);

    if (this.classList.contains("invalid")) {
      clearHint(cvvHint, this);
    }
    hideStatus();
  });

  // ---- Clear status on any field change ----
  [nameInput, cardInput, expiryInput, cvvInput].forEach(function (el) {
    el.addEventListener("input", hideStatus);
  });

  /* ----------------------------------------------------------
     PER-FIELD BLUR VALIDATION
     (Provides early feedback before submission)
  ---------------------------------------------------------- */

  nameInput.addEventListener("blur", function () {
    validateName(true);
  });

  cardInput.addEventListener("blur", function () {
    validateCard(true);
  });

  expiryInput.addEventListener("blur", function () {
    validateExpiry(true);
  });

  cvvInput.addEventListener("blur", function () {
    validateCVV(true);
  });

  /* ----------------------------------------------------------
     INDIVIDUAL FIELD VALIDATORS
     @param {boolean} showSuccess - Whether to show a green tick on pass
     @returns {boolean}           - true = valid
  ---------------------------------------------------------- */

  function validateName(showSuccess) {
    const val = nameInput.value.trim();
    if (!val) {
      setHint(nameHint, nameInput, "Cardholder name is required.", "error");
      return false;
    }
    if (val.length < 2) {
      setHint(nameHint, nameInput, "Name must be at least 2 characters.", "error");
      return false;
    }
    if (!/^[a-zA-Z\s'\-\.]+$/.test(val)) {
      setHint(nameHint, nameInput, "Name may only contain letters, spaces, hyphens, and periods.", "error");
      return false;
    }
    if (showSuccess) setHint(nameHint, nameInput, "✓", "success");
    else             clearHint(nameHint, nameInput);
    return true;
  }

  function validateCard(showSuccess) {
    // Remove spaces before checking length
    const digits = digitsOnly(cardInput.value);

    if (!digits) {
      setHint(cardHint, cardInput, "Card number is required.", "error");
      return false;
    }
    if (digits.length !== 16) {
      setHint(cardHint, cardInput, "Card number must be exactly 16 digits.", "error");
      return false;
    }
    if (showSuccess) setHint(cardHint, cardInput, "✓", "success");
    else             clearHint(cardHint, cardInput);
    return true;
  }

  function validateExpiry(showSuccess) {
    const digits = digitsOnly(expiryInput.value);

    if (!digits) {
      setHint(expiryHint, expiryInput, "Expiry date is required.", "error");
      return false;
    }
    if (digits.length !== 4) {
      setHint(expiryHint, expiryInput, "Enter a valid expiry date (MM / YY).", "error");
      return false;
    }

    const month = parseInt(digits.slice(0, 2), 10);
    const year  = parseInt(digits.slice(2, 4), 10);

    if (month < 1 || month > 12) {
      setHint(expiryHint, expiryInput, "Month must be between 01 and 12.", "error");
      return false;
    }

    // Check card hasn't expired
    const now          = new Date();
    const currentYear  = now.getFullYear() % 100; // two-digit year
    const currentMonth = now.getMonth() + 1;       // 1–12

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setHint(expiryHint, expiryInput, "This card has expired.", "error");
      return false;
    }

    if (showSuccess) setHint(expiryHint, expiryInput, "✓", "success");
    else             clearHint(expiryHint, expiryInput);
    return true;
  }

  function validateCVV(showSuccess) {
    const val = cvvInput.value.trim();

    if (!val) {
      setHint(cvvHint, cvvInput, "CVV is required.", "error");
      return false;
    }
    if (!/^\d{3,4}$/.test(val)) {
      setHint(cvvHint, cvvInput, "CVV must be 3 or 4 digits.", "error");
      return false;
    }
    if (showSuccess) setHint(cvvHint, cvvInput, "✓", "success");
    else             clearHint(cvvHint, cvvInput);
    return true;
  }

  /* ----------------------------------------------------------
     FORM SUBMISSION
  ---------------------------------------------------------- */

  form.addEventListener("submit", function (e) {
    // Always prevent default — we handle submission manually
    e.preventDefault();

    // Run all validators; collect results
    const isNameValid   = validateName(false);
    const isCardValid   = validateCard(false);
    const isExpiryValid = validateExpiry(false);
    const isCVVValid    = validateCVV(false);

    const allValid = isNameValid && isCardValid && isExpiryValid && isCVVValid;

    if (!allValid) {
      // Focus the first invalid field for accessibility
      if (!isNameValid)   { nameInput.focus();   }
      else if (!isCardValid)   { cardInput.focus();   }
      else if (!isExpiryValid) { expiryInput.focus(); }
      else                     { cvvInput.focus();    }

      showStatus(
        "Please fix the errors above before continuing.",
        "error"
      );
      return;
    }

    /* ---- All fields valid ---- */

    // Strip spaces from card number before "sending"
    const cleanCardNumber = digitsOnly(cardInput.value);

    // Final hard check: must be exactly 16 digits
    if (cleanCardNumber.length !== 16) {
      showStatus(
        "Card number must contain exactly 16 digits. Please check and try again.",
        "error"
      );
      setHint(cardHint, cardInput, "Must be exactly 16 digits.", "error");
      cardInput.focus();
      return;
    }

    // In a real app you would POST to your payments API here.
    // We log the sanitised values to the console to demonstrate.
    console.log("Payment payload (demo):", {
      cardholderName: nameInput.value.trim(),
      cardNumber:     cleanCardNumber,   // spaces removed
      expiryDate:     expiryInput.value.trim(),
      // CVV is intentionally NOT logged in production
    });

    showStatus(
      "✓ Payment authorised successfully. Thank you!",
      "success"
    );

    // Disable submit button to prevent double-submission
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").textContent = "Payment Sent";
  });

})(); // end IIFE