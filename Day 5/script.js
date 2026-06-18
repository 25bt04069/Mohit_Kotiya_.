const cardNumberInput = document.getElementById("cardNumber");
const paymentForm = document.getElementById("paymentForm");
const message = document.getElementById("message");

/*
 Auto-format card number
 Example:
 1234567812345678
 becomes
 1234 5678 1234 5678
*/
cardNumberInput.addEventListener("input", function () {

    // Remove non-digits
    let value = this.value.replace(/\D/g, "");

    // Limit to 16 digits
    value = value.substring(0, 16);

    // Add spaces every 4 digits
    value = value.replace(/(.{4})/g, "$1 ").trim();

    this.value = value;
});

/*
 Validate before submission
 Must contain exactly 16 digits
*/
paymentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const digitsOnly = cardNumberInput.value.replace(/\s/g, "");

    if (digitsOnly.length !== 16) {
        message.textContent =
            "Card number must contain exactly 16 digits.";

        message.className = "message error";
        return;
    }

    message.textContent =
        "Payment submitted successfully!";

    message.className = "message success";
});