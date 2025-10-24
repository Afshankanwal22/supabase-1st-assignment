const supabaseUrl = "https://jzorrdpsvtvoglvxhjfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b3JyZHBzdnR2b2dsdnhoamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDA3MzMsImV4cCI6MjA3NjYxNjczM30.HOrkOrtH03AS-q9W-E0w7woDS2ESPDIVBaS64qzDpZw";
const { createClient } = supabase;
const client = supabase.createClient(supabaseUrl, supabaseKey);
console.log(client);



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
      }).then(() => (window.location.href = "input-form.html"));
    }
  });
}


// ================= Add Task =================
const inputForm = document.getElementById("input-form");

if(inputForm){
  inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const priority = document.querySelector('input[name="priority"]:checked')?.value;

    if(!priority) return Swal.fire("Error", "Select a priority", "error");

    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if(sessionError || !session) return Swal.fire("Error", "You must be logged in", "error");

    const userId = session.user.id;

    const { error } = await client.from("task").insert([{ user_id: userId, title, priority, description }]);
    if(error) return Swal.fire("Error", error.message, "error");

    Swal.fire({ icon: "success", title: "Task Added!", timer: 1500, showConfirmButton: false })
     .then(() => window.location.href = "posts.html");
    inputForm.reset();
    fetchTasks(); 
  });
}

// ================= Fetch Tasks =================
async function fetchTasks(priorityFilter=null){
  const { data: { session } } = await client.auth.getSession();
  if(!session) return Swal.fire("Error", "Login first", "error");

  let query = client.from("task")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false });

  if(priorityFilter) query = query.eq("priority", priorityFilter);

  const { data, error } = await query;
  if(error) return Swal.fire("Error", error.message, "error");

  renderTasks(data);
}

function renderTasks(tasks){
  const container = document.getElementById("tasks-container");
  container.innerHTML = '';

  if(!tasks || tasks.length===0){
    container.innerHTML = "<p class='text-gray-600 text-center'>No tasks found.</p>";
    return;
  }

  tasks.forEach(task=>{
    let colorClass = task.priority==='High'?'bg-red-500':
                     task.priority==='Medium'?'bg-yellow-400':'bg-green-500';

    const div = document.createElement("div");
    div.className = `${colorClass} text-white p-3 rounded-lg`;
    div.innerHTML = `<strong>${task.title}</strong><br>${task.description}<br><em>${task.priority}</em>`;
    container.appendChild(div);
  });
}

// Filter buttons
document.getElementById("filter-all").addEventListener("click", ()=>fetchTasks(null));
document.getElementById("filter-high").addEventListener("click", ()=>fetchTasks("High"));
document.getElementById("filter-medium").addEventListener("click", ()=>fetchTasks("Medium"));
document.getElementById("filter-low").addEventListener("click", ()=>fetchTasks("Low"));

// On load
document.addEventListener("DOMContentLoaded", ()=>fetchTasks());
