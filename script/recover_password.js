// Autor: Leonardo Amad

// Validação simples do campo de e-mail
    const btn = document.getElementById("recover-btn");
    btn.addEventListener("click", () => {
      const email = document.getElementById("email").value;
      if (!email) {
        alert("Por favor, insira seu e-mail.");
      } else {
        alert("Se este e-mail estiver cadastrado, você receberá as instruções.");
      }
    });