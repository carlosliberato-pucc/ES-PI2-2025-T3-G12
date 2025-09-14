const signupBtn = document.getElementById("signup-btn");
    signupBtn.addEventListener("click", () => {
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const password = document.getElementById("password").value;

      if (!name || !email || !phone || !password) {
        alert("Por favor, preencha todos os campos.");
      } else if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
      } else {
        alert("Cadastro realizado com sucesso! (exemplo)");

      }
    });