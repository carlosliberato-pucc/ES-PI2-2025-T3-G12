//Autor: Leonardo Amad

const loginBtn = document.getElementById("login-btn");
    loginBtn.addEventListener("click", () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("Por favor, preencha todos os campos.");
      } else {
        alert("Login realizado com sucesso! (exemplo)"); //Funcionará assim que integrar com BD
      }
    });