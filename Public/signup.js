async function signup() {

const firstname = document.getElementById("firstname").value;
const lastname = document.getElementById("lastname").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const role = document.getElementById("role").value;

try {

const response = await fetch("https://campusmind-8r5t.onrender.com/Signup", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
firstname,
lastname,
email,
password,
role
})

});

const data = await response.json();

if(response.ok){

alert("Account created successfully!");

window.location.href = "login.html";

}else{

document.getElementById("error").innerText = data.message;

}

}catch(err){

document.getElementById("error").innerText = "Server error";

}

}