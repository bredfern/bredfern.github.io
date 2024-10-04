function handleSubmit(event) {
  event.preventDefault();

  const status = document.getElementById("contact-form-status");
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  window.location.href = `mailto:brianwredfern@gmail.com?subject=Thesubject${email}&body=${message}}`;
  status.innerHTML = "Thanks for saying hello!";
  form.reset();
}

function startup() {
  const btn = document.getElementById("contact-form-button");
  btn.addEventListener("click", handleSubmit);
}

document.addEventListener("DOMContentLoaded", startup);
