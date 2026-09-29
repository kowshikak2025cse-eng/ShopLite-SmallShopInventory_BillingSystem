// ============================================
// SHOPLITE AUTHENTICATION
// Shop Owner / Admin only
// ============================================


// ============================================
// DEFAULT SHOP OWNER ACCOUNT
// ============================================

const DEFAULT_ADMIN = {

    name: "Shop Owner",

    email: "admin@shoplite.com",

    password: "admin123",

    role: "ADMIN"

};


// ============================================
// INITIALIZE DEFAULT ACCOUNT
// ============================================

function initializeDefaultAccount() {

    const users =
        JSON.parse(
            localStorage.getItem("shopliteUsers")
        ) || [];


    const adminExists =
        users.some(
            user =>
                user.email === DEFAULT_ADMIN.email
        );


    if (!adminExists) {

        users.push(DEFAULT_ADMIN);

        localStorage.setItem(
            "shopliteUsers",
            JSON.stringify(users)
        );

    }

}


initializeDefaultAccount();


// ============================================
// LOGIN
// ============================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const users =
                JSON.parse(
                    localStorage.getItem(
                        "shopliteUsers"
                    )
                ) || [];


            const user =
                users.find(
                    item =>
                        item.email.toLowerCase() === email &&
                        item.password === password
                );


            if (!user) {

                message.textContent =
                    "Invalid email or password.";

                message.className =
                    "error-message";

                return;

            }


            // Store logged-in user
            localStorage.setItem(
                "shopliteLoggedIn",
                "true"
            );


            localStorage.setItem(
                "shopliteCurrentUser",
                JSON.stringify(user)
            );


            message.textContent =
                "Login successful. Opening dashboard...";

            message.className =
                "success-message";


            setTimeout(() => {

                window.location.href = "index.html";

            }, 700);

        }
    );

}


// ============================================
// SIGNUP
// ============================================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("signupName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("signupPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const message =
                document.getElementById(
                    "signupMessage"
                );


            // Password check
            if (password.length < 6) {

                message.textContent =
                    "Password must contain at least 6 characters.";

                message.className =
                    "error-message";

                return;

            }


            // Confirm password
            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.className =
                    "error-message";

                return;

            }


            let users =
                JSON.parse(
                    localStorage.getItem(
                        "shopliteUsers"
                    )
                ) || [];


            // Check existing email
            const existingUser =
                users.find(
                    user =>
                        user.email.toLowerCase() ===
                        email
                );


            if (existingUser) {

                message.textContent =
                    "An account with this email already exists.";

                message.className =
                    "error-message";

                return;

            }


            // Create Shop Owner account
            const newUser = {

                name: name,

                email: email,

                password: password,

                role: "ADMIN"

            };


            users.push(newUser);


            localStorage.setItem(
                "shopliteUsers",
                JSON.stringify(users)
            );


            message.textContent =
                "Account created successfully! Redirecting to login...";

            message.className =
                "success-message";


            signupForm.reset();


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);

        }
    );

}