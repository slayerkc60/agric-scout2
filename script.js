document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    console.log(signupForm, "Signup form found");

    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

    window.location.href="AI_AGENT/index.html"

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      fetch("https://scout-m4ru.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          email: email,
          password: password
        })
      })
      
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log("success:", data);
        localStorage.setItem("email", email);
        alert("Registration successful")
        window.location.href="AI_AGENT/index.html"
      })

      .catch(error => {
        console.error("There was a problem with the fetch:", error);
      });
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      console.log("Attempting login with:", email, password);

      fetch("https://scout-m4ru.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            console.error("Login error from server:", errData);
            throw new Error(errData.detail || "Login failed");
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Login success:", data);
        alert("login succesful")
            })
      .catch(error => {
        console.error("There was a problem with the login fetch:", error);
      });
    });
  }
});






