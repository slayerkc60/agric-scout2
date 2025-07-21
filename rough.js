
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
  
})
.catch(error => {
  console.error("There was a problem with the login fetch:", error);
});
