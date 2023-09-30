console.log("Página cargada");

document.addEventListener("DOMContentLoaded", function() {
  Swal.fire({
    title: 'Iniciar Sesión',
    html:
      '<input type="text" id="login" class="swal2-input" placeholder="Usuario">' +
      '<input type="password" id="password" class="swal2-input" placeholder="Contraseña">',
    confirmButtonText: 'Iniciar Sesión',
    focusConfirm: false,
    allowOutsideClick: false,  // Esto evita que el modal se cierre al hacer clic fuera
  // En el preConfirm del modal de SweetAlert2
preConfirm: () => {
  const login = Swal.getPopup().querySelector('#login').value;
  const password = Swal.getPopup().querySelector('#password').value;

  // Llamada al endpoint de autenticación
  fetch('https://vauchers2-0.onrender.com/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: login, password })
  })
  .then(response => response.json())
  .then(data => {
    localStorage.setItem('token', data.token);
    // Eliminar o esconder la capa opaca
    document.getElementById('overlay').style.display = 'none';
    validateVoucher();
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

  });
});






// Obtener el ID del voucher desde la URL
const urlParams = new URLSearchParams(window.location.search);
const voucherID = urlParams.get('voucher_id');

// Función para validar el voucher
async function validateVoucher() {
  const token = localStorage.getItem('token');  // Obtener el token del almacenamiento local
  console.log("Token almacenado:", token);
   // Realizar la petición al servidor con el token en el encabezado
  const response = await fetch(`https://vauchers2-0.onrender.com/validate/${voucherID}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log("Backend Response:", response);

  if (response.ok) {
    const data = await response.json();
    // Mostrar alerta de éxito con el mensaje del premio
    Swal.fire(
      '¡Válido!',
      `Premio: ${data.message}`,
      'success'
    );
  } else {
    // Mostrar alerta de error indicando que el voucher ya ha sido canjeado o no existe
    Swal.fire(
      'Error',
      'Este voucher ya ha sido canjeado o no es válido.',
      'error'
    );
  }
}
// async function validateVoucher() {
//   try {
//     const response = await fetch(`http://localhost:3000/validate/${voucherID}`);
    
//     if (response.status === 200) {
//       const data = await response.json();
//       Swal.fire('¡Válido!', `Premio: ${data.message}`, 'success');
//     } else if (response.status === 409) {
//       Swal.fire('Error', 'Este voucher ya ha sido canjeado.', 'error');
//     } else {
//       Swal.fire('Error', 'Voucher no encontrado o inválido.', 'error');
//     }
//   } catch (error) {
//     Swal.fire('Error', 'Ocurrió un error durante la validación.', 'error');
//   }
// }


// Ejecutar la validación al cargar la página

