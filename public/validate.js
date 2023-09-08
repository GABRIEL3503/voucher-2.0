// Obtener el ID del voucher desde la URL
const urlParams = new URLSearchParams(window.location.search);
const voucherID = urlParams.get('voucher_id');

// Función para validar el voucher
async function validateVoucher() {
    const response = await fetch(`https://vauchers1-0.onrender.com/validate/${voucherID}`);

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

// Ejecutar la validación al cargar la página
validateVoucher();
