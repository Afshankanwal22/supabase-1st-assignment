const supabaseUrl = "https://jzorrdpsvtvoglvxhjfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b3JyZHBzdnR2b2dsdnhoamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDA3MzMsImV4cCI6MjA3NjYxNjczM30.HOrkOrtH03AS-q9W-E0w7woDS2ESPDIVBaS64qzDpZw";
const { createClient } = supabase;
const client = supabase.createClient(supabaseUrl, supabaseKey);


// ========== Sign Up ==========
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(signupForm);
  
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;
    console.log(email, password);

    if (password !== confirmPassword) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }

    try {
      const { error } = await client.auth.signUp({ email, password });

      if (error) throw error;
      Swal.fire(
        "Signed up!",
        "Check your email to confirm your account.",
        "success"
      ).then(() => (window.location.href = "index.html"));
    } catch (err) {
      Swal.fire("Signup Failed", err.message, "error");
    }
  });
}

// ========== Login ==========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmailInput").value.trim();
    const password = document.getElementById("loginPasswordInput").value;

    if (!email || !password) {
      return Swal.fire("Error", "Please enter email and password", "error");
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      let msg = error.message.includes("confirm")
        ? "Please confirm your email first."
        : error.message;
      Swal.fire("Login Failed", msg, "error");
    } else {
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => (window.location.href = "dashboard.html"));
    }
  });
}